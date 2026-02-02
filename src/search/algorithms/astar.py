"""A* Search implementation."""
from __future__ import annotations
import time
from heapq import heappush, heappop

from .base import SearchAlgorithm, SearchNode, SearchResult
from ..heuristics.base import HeuristicFunction
from ..heuristics.goal_count import GoalCountHeuristic
from ...representations.state import State


class AStar(SearchAlgorithm):
    """
    A* Search with configurable heuristic.
    Complete and optimal with admissible heuristic.
    """
    
    def __init__(self, task, timeout: float = 30.0, 
                 heuristic: HeuristicFunction | None = None):
        """
        Initialize A* search.
        
        Args:
            task: The planning task
            timeout: Maximum search time in seconds
            heuristic: Heuristic function (default: GoalCountHeuristic)
        """
        super().__init__(task, timeout)
        self.heuristic = heuristic or GoalCountHeuristic(task)
        self.recorded_nodes = set()  # Track recorded node IDs
    
    def search(self) -> SearchResult:
        """Execute A* search."""
        start_time = time.time()
        self.recorded_nodes.clear()
        
        initial_state = self.task.initial_state
        goal = self.task.goal
        
        # Check if initial state is goal
        if self.task.is_goal_reached(initial_state):
            return SearchResult(
                success=True,
                plan=[],
                nodes_expanded=0,
                nodes_generated=1,
                search_time_ms=0.0,
                plan_length=0,
                search_tree=self._get_search_tree()
            )
        
        # Calculate initial heuristic
        initial_h = self.heuristic.calculate(initial_state)
        
        # Create root node
        root = self._create_node(initial_state, h_cost=initial_h)
        self._record_node_once(root)
        
        # Frontier: priority queue ordered by f(n) = g(n) + h(n)
        frontier = [(root.f_cost, root.node_id, root)]
        frontier_states = {initial_state: root.g_cost}
        
        # Closed set: states we've expanded
        closed_set = set()
        
        while frontier:
            # Check timeout
            if time.time() - start_time > self.timeout:
                elapsed = (time.time() - start_time) * 1000
                return SearchResult(
                    success=False,
                    error_message="Search timeout",
                    nodes_expanded=self.nodes_expanded,
                    nodes_generated=self.nodes_generated,
                    search_time_ms=elapsed,
                    initial_h=initial_h,
                    search_tree=self._get_search_tree()
                )
            
            # Get node with lowest f_cost
            _, _, node = heappop(frontier)
            
            # Skip if already expanded
            if node.state in closed_set:
                continue
            
            closed_set.add(node.state)
            del frontier_states[node.state]
            
            self.nodes_expanded += 1
            self._record_expanded(node)
            
            # Check if goal reached
            if self.task.is_goal_reached(node.state):
                elapsed = (time.time() - start_time) * 1000
                plan = node.get_action_sequence()
                return SearchResult(
                    success=True,
                    plan=plan,
                    nodes_expanded=self.nodes_expanded,
                    nodes_generated=self.nodes_generated,
                    search_time_ms=elapsed,
                    plan_length=len(plan),
                    initial_h=initial_h,
                    final_h=node.h_cost,
                    search_tree=self._get_search_tree()
                )
            
            # Generate successors
            for action in self.task.get_applicable_actions(node.state):
                new_state_preds = action.apply(node.state.predicates)
                new_state = State(new_state_preds)
                self.nodes_generated += 1
                
                # Skip if already expanded
                if new_state in closed_set:
                    continue
                
                new_g = node.g_cost + 1
                
                # Check if in frontier with better g_cost
                if new_state in frontier_states:
                    if frontier_states[new_state] <= new_g:
                        continue
                
                # Calculate heuristic
                h = self.heuristic.calculate(new_state)
                
                # Create child node
                child = self._create_node(
                    state=new_state,
                    action=action,
                    parent=node,
                    g_cost=new_g,
                    h_cost=h
                )
                self._record_node_once(child)
                
                # Add to frontier
                frontier_states[new_state] = new_g
                heappush(frontier, (child.f_cost, child.node_id, child))
        
        # No solution found
        elapsed = (time.time() - start_time) * 1000
        return SearchResult(
            success=False,
            error_message="No solution exists",
            nodes_expanded=self.nodes_expanded,
            nodes_generated=self.nodes_generated,
            search_time_ms=elapsed,
            initial_h=initial_h,
            search_tree=self._get_search_tree()
        )
    
    def _record_node_once(self, node: SearchNode):
        """Record node only if not already recorded."""
        node_id = f"n{node.node_id}"
        if node_id in self.recorded_nodes:
            return
        self.recorded_nodes.add(node_id)
        
        self.search_tree_nodes.append({
            'id': node_id,
            'state_hash': hash(node.state),
            'heuristic': node.h_cost,
            'depth': node.depth,
            'g_cost': node.g_cost,
            'is_goal': self.task.is_goal_reached(node.state),
            'is_expanded': False
        })
        
        if node.parent:
            self.search_tree_edges.append({
                'source': f"n{node.parent.node_id}",
                'target': node_id,
                'action': node.action.name if node.action else None
            })
    
    def _record_expanded(self, node: SearchNode):
        """Mark node as expanded in the search tree."""
        node_id = f"n{node.node_id}"
        for n in self.search_tree_nodes:
            if n['id'] == node_id:
                n['is_expanded'] = True
                break
