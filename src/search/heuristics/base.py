"""Base class for heuristic functions."""
from abc import ABC, abstractmethod

from ...representations.state import State
from ...representations.task import Task


class HeuristicFunction(ABC):
    """Abstract base class for heuristic functions."""
    
    def __init__(self, task: Task):
        """
        Initialize heuristic with task.
        
        Args:
            task: The planning task
        """
        self.task = task
        self.goal = task.goal
    
    @abstractmethod
    def calculate(self, state: State) -> float:
        """
        Calculate heuristic value for a state.
        
        Args:
            state: Current state
            
        Returns:
            Estimated cost to reach goal
        """
        pass
    
    def is_goal(self, state: State) -> bool:
        """Check if state satisfies the goal."""
        return self.task.is_goal_reached(state)
