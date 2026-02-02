"""Base class for search algorithms."""
from __future__ import annotations
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import List, Optional, Dict, Set, Tuple
from heapq import heappush, heappop

from ...representations.state import State
from ...representations.action import Action
from ...representations.task import Task


@dataclass
class SearchNode:
    """A node in the search tree."""
    state: State
    action: Optional[Action] = None  # Action that led to this state
    parent: Optional[SearchNode] = None
    g_cost: float = 0.0  # Path cost from start
    h_cost: float = 0.0  # Heuristic estimate to goal
    depth: int = 0
    node_id: int = 0
    
    @property
    def f_cost(self) -> float:
        """f(n) = g(n) + h(n)"""
        return self.g_cost + self.h_cost
    
    def __lt__(self, other: SearchNode) -> bool:
        """Comparison for priority queue."""
        return self.f_cost < other.f_cost
    
    def get_path(self) -> List[Tuple[State, Optional[Action]]]:
        """Reconstruct path from root to this node."""
        path = []
        current: Optional[SearchNode] = self
        while current is not None:
            path.append((current.state, current.action))
            current = current.parent
        return list(reversed(path))
    
    def get_action_sequence(self) -> List[Action]:
        """Get sequence of actions from root to this node."""
        actions = []
        current: Optional[SearchNode] = self
        while current is not None:
            if current.action is not None:
                actions.append(current.action)
            current = current.parent
        return list(reversed(actions))


@dataclass
class SearchResult:
    """Result of a search."""
    success: bool
    plan: List[Action] = field(default_factory=list)
    nodes_expanded: int = 0
    nodes_generated: int = 0
    search_time_ms: float = 0.0
    plan_length: int = 0
    initial_h: float = 0.0
    final_h: float = 0.0
    search_tree: Optional[Dict] = None
    error_message: Optional[str] = None


class SearchAlgorithm(ABC):
    """Abstract base class for search algorithms."""
    
    def __init__(self, task: Task, timeout: float = 30.0):
        """
        Initialize search algorithm.
        
        Args:
            task: The planning task
            timeout: Maximum search time in seconds
        """
        self.task = task
        self.timeout = timeout
        self.nodes_expanded = 0
        self.nodes_generated = 0
        self.start_time = 0.0
        self.node_counter = 0
        self.search_tree_nodes: List[Dict] = []
        self.search_tree_edges: List[Dict] = []
    
    @abstractmethod
    def search(self) -> SearchResult:
        """Execute search and return result."""
        pass
    
    def _create_node(self, state: State, action: Optional[Action] = None, 
                     parent: Optional[SearchNode] = None, g_cost: float = 0.0,
                     h_cost: float = 0.0) -> SearchNode:
        """Create a new search node."""
        self.node_counter += 1
        depth = parent.depth + 1 if parent else 0
        return SearchNode(
            state=state,
            action=action,
            parent=parent,
            g_cost=g_cost,
            h_cost=h_cost,
            depth=depth,
            node_id=self.node_counter
        )
    
    def _record_node(self, node: SearchNode, is_goal: bool = False, 
                     is_expanded: bool = False):
        """Record node for search tree visualization."""
        self.search_tree_nodes.append({
            'id': f"n{node.node_id}",
            'state_hash': hash(node.state),
            'heuristic': node.h_cost,
            'depth': node.depth,
            'g_cost': node.g_cost,
            'is_goal': is_goal,
            'is_expanded': is_expanded
        })
        
        if node.parent:
            self.search_tree_edges.append({
                'source': f"n{node.parent.node_id}",
                'target': f"n{node.node_id}",
                'action': node.action.name if node.action else None
            })
    
    def _get_search_tree(self) -> Dict:
        """Get the recorded search tree."""
        return {
            'nodes': self.search_tree_nodes,
            'edges': self.search_tree_edges
        }