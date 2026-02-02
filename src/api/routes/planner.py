"""Planner API routes."""
import asyncio
from concurrent.futures import ThreadPoolExecutor, as_completed
from fastapi import APIRouter, HTTPException
from typing import Literal, List

from ..models import PlanRequest, PlanResponse, ActionResult, SearchMetrics, SearchTree, SearchTreeNode, SearchTreeEdge
from ...parser.domain_parser import DomainParser
from ...parser.problem_parser import ProblemParser
from ...grounding.grounder import Grounder
from ...search.algorithms.bfs import BFS
from ...search.algorithms.astar import AStar
from ...search.algorithms.greedy import GreedyBestFirst
from ...search.heuristics.goal_count import GoalCountHeuristic
from ...search.heuristics.h_add import HAddHeuristic
from ...search.heuristics.h_max import HMaxHeuristic

router = APIRouter(prefix="/api/v1", tags=["planner"])

# Thread pool for parallel search
_executor = ThreadPoolExecutor(max_workers=4)


@router.post("/plan", response_model=PlanResponse)
async def plan(request: PlanRequest):
    """
    Generate a plan for the given domain and problem.
    """
    try:
        # Parse domain
        domain_parser = DomainParser()
        domain = domain_parser.parse(request.domain_pddl)
        
        # Parse problem
        problem_parser = ProblemParser()
        problem = problem_parser.parse(request.problem_pddl)
        
        # Ground the task
        grounder = Grounder(domain, problem)
        task = grounder.ground_task()
        
        # Select algorithm
        if request.algorithm == "bfs":
            algorithm = BFS(task, timeout=request.timeout)
        elif request.algorithm == "astar":
            heuristic = _get_heuristic(request.heuristic, task)
            algorithm = AStar(task, timeout=request.timeout, heuristic=heuristic)
        elif request.algorithm == "greedy":
            heuristic = _get_heuristic(request.heuristic, task)
            algorithm = GreedyBestFirst(task, timeout=request.timeout, heuristic=heuristic)
        else:
            raise HTTPException(status_code=400, detail=f"Unknown algorithm: {request.algorithm}")
        
        # Run search
        result = algorithm.search()
        
        if not result.success:
            # Handle infinity values for JSON serialization
            initial_h = result.initial_h if result.initial_h != float('inf') else 999999.0
            final_h = result.final_h if result.final_h != float('inf') else 999999.0
            
            return PlanResponse(
                success=False,
                error_message=result.error_message,
                metrics=SearchMetrics(
                    nodes_expanded=result.nodes_expanded,
                    nodes_generated=result.nodes_generated,
                    plan_length=0,
                    search_time_ms=result.search_time_ms,
                    initial_h=initial_h,
                    final_h=final_h
                ) if result.nodes_expanded > 0 else None,
                search_tree=_convert_search_tree(result.search_tree) if result.search_tree else None
            )
        
        # Convert plan to response format
        plan_actions = []
        for action in result.plan:
            plan_actions.append(ActionResult(
                action=action.name,
                preconditions=list(action.preconditions),
                effects_add=list(action.add_effects),
                effects_del=list(action.del_effects)
            ))
        
        # Handle infinity values for JSON serialization
        initial_h = result.initial_h if result.initial_h != float('inf') else 999999.0
        final_h = result.final_h if result.final_h != float('inf') else 999999.0
        
        return PlanResponse(
            success=True,
            plan=plan_actions,
            metrics=SearchMetrics(
                nodes_expanded=result.nodes_expanded,
                nodes_generated=result.nodes_generated,
                plan_length=result.plan_length,
                search_time_ms=result.search_time_ms,
                initial_h=initial_h,
                final_h=final_h
            ),
            search_tree=_convert_search_tree(result.search_tree) if result.search_tree else None
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/plan-parallel", response_model=PlanResponse)
async def plan_parallel(request: PlanRequest):
    """
    Run multiple algorithms in parallel and return the best result.
    """
    try:
        # Parse domain and problem once
        domain_parser = DomainParser()
        domain = domain_parser.parse(request.domain_pddl)
        
        problem_parser = ProblemParser()
        problem = problem_parser.parse(request.problem_pddl)
        
        grounder = Grounder(domain, problem)
        task = grounder.ground_task()
        
        # Define algorithms to run in parallel
        configs = [
            ("greedy", "goal_count"),
            ("astar", "goal_count"),
            ("astar", "h_add"),
            ("bfs", None),
        ]
        
        # Run searches in parallel
        futures = []
        for algo, heur in configs:
            future = _executor.submit(_run_search, task, algo, heur, request.timeout)
            futures.append((algo, heur, future))
        
        # Collect results
        results = []
        for algo, heur, future in futures:
            try:
                result = future.result(timeout=request.timeout + 1)
                if result.success:
                    results.append((algo, heur, result))
            except Exception:
                pass
        
        if not results:
            return PlanResponse(
                success=False,
                error_message="No algorithm found a solution",
                plan=[],
                metrics=None,
                search_tree=None
            )
        
        # Pick best result (shortest plan)
        best_algo, best_heur, best_result = min(results, key=lambda x: x[2].plan_length)
        
        # Convert to response
        plan_actions = []
        for action in best_result.plan:
            plan_actions.append(ActionResult(
                action=action.name,
                preconditions=list(action.preconditions),
                effects_add=list(action.add_effects),
                effects_del=list(action.del_effects)
            ))
        
        initial_h = best_result.initial_h if best_result.initial_h != float('inf') else 999999.0
        final_h = best_result.final_h if best_result.final_h != float('inf') else 999999.0
        
        return PlanResponse(
            success=True,
            plan=plan_actions,
            metrics=SearchMetrics(
                nodes_expanded=best_result.nodes_expanded,
                nodes_generated=best_result.nodes_generated,
                plan_length=best_result.plan_length,
                search_time_ms=best_result.search_time_ms,
                initial_h=initial_h,
                final_h=final_h
            ),
            search_tree=_convert_search_tree(best_result.search_tree) if best_result.search_tree else None
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _run_search(task, algorithm: str, heuristic: str, timeout: float):
    """Run a single search algorithm."""
    if algorithm == "bfs":
        algo = BFS(task, timeout=timeout)
    elif algorithm == "astar":
        heur = _get_heuristic(heuristic, task)
        algo = AStar(task, timeout=timeout, heuristic=heur)
    elif algorithm == "greedy":
        heur = _get_heuristic(heuristic, task)
        algo = GreedyBestFirst(task, timeout=timeout, heuristic=heur)
    else:
        raise ValueError(f"Unknown algorithm: {algorithm}")
    
    return algo.search()


def _get_heuristic(name: str, task):
    """Get heuristic by name."""
    if name == "goal_count":
        return GoalCountHeuristic(task)
    elif name == "h_add":
        return HAddHeuristic(task)
    elif name == "h_max":
        return HMaxHeuristic(task)
    else:
        return GoalCountHeuristic(task)


def _convert_search_tree(tree_data: dict) -> SearchTree:
    """Convert internal search tree to response format."""
    nodes = []
    for node in tree_data.get('nodes', []):
        # Handle infinity values for JSON serialization
        heuristic = node['heuristic']
        if heuristic == float('inf') or heuristic == float('-inf'):
            heuristic = 999999.0
        g_cost = node['g_cost']
        if g_cost == float('inf') or g_cost == float('-inf'):
            g_cost = 999999.0
            
        nodes.append(SearchTreeNode(
            id=node['id'],
            state_hash=node['state_hash'],
            heuristic=heuristic,
            depth=node['depth'],
            g_cost=g_cost,
            is_goal=node['is_goal'],
            is_expanded=node['is_expanded']
        ))
    
    edges = []
    for edge in tree_data.get('edges', []):
        edges.append(SearchTreeEdge(
            source=edge['source'],
            target=edge['target'],
            action=edge['action']
        ))
    
    return SearchTree(nodes=nodes, edges=edges)
