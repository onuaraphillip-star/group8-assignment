"""Breadth-First Search implementation."""
from __future__ import annotations
from collections import deque
import time

from .base import SearchAlgorithm, SearchNode, SearchResult
from ...representations.state import State


class BFS(SearchAlgorithm):
    """
    Breadth-First Search.
    Complete and optimal for unweighted graphs.
    """
    
    def __init__(self, task, timeout: float = 30.0):
        super().__init__(task, timeout)
        self.recorded_nodes = set()
    
    def search(self) -> SearchResult:
        """Execute BFS search."""
        start_time = time.time()
        self.recorded_nodes.clear()
        
        # Initialize
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
        
        # Create root node
        root = self._create_node(initial_state)
        self._record_node_once(root)
        
        # Frontier: queue of nodes to expand
        frontier = deque([root])
        
        # Visited set: states we've already seen
        visited = {initial_state}
        
        while frontier:
            # Check timeout
            if time.time() - start_time > self.timeout:
                return SearchResult(
                    success=False,
                    error_message="Search timeout",
                    nodes_expanded=self.nodes_expanded,
                    nodes_generated=self.nodes_generated,
                    search_time_ms=(time.time() - start_time) * 1000,
                    search_tree=self._get_search_tree()
                )
            
            # Get next node from frontier
            node = frontier.popleft()
            self.nodes_expanded += 1
            self._record_expanded(node)
            
            # Generate successors
            for action in self.task.get_applicable_actions(node.state):
                new_state_preds = action.apply(node.state.predicates)
                new_state = State(new_state_preds)
                self.nodes_generated += 1
                
                # Skip if already visited
                if new_state in visited:
                    continue
                
                visited.add(new_state)
                
                # Create child node
                child = self._create_node(
                    state=new_state,
                    action=action,
                    parent=node,
                    g_cost=node.g_cost + 1
                )
                self._record_node_once(child)
                
                # Check if goal reached
                if self.task.is_goal_reached(new_state):
                    elapsed = (time.time() - start_time) * 1000
                    plan = child.get_action_sequence()
                    return SearchResult(
                        success=True,
                        plan=plan,
                        nodes_expanded=self.nodes_expanded,
                        nodes_generated=self.nodes_generated,
                        search_time_ms=elapsed,
                        plan_length=len(plan),
                        search_tree=self._get_search_tree()
                    )
                
                # Add to frontier
                frontier.append(child)
        
        # No solution found
        elapsed = (time.time() - start_time) * 1000
        return SearchResult(
            success=False,
            error_message="No solution exists",
            nodes_expanded=self.nodes_expanded,
            nodes_generated=self.nodes_generated,
            search_time_ms=elapsed,
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
