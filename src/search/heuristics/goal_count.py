"""Goal Count Heuristic - simple baseline heuristic."""
from .base import HeuristicFunction
from ...representations.state import State


class GoalCountHeuristic(HeuristicFunction):
    """
    Counts the number of unsatisfied goal predicates.
    Simple but not admissible (can overestimate).
    """
    
    def calculate(self, state: State) -> float:
        """Count unsatisfied goals."""
        unsatisfied = 0
        for pred in self.goal:
            if pred not in state.predicates:
                unsatisfied += 1
        return float(unsatisfied)
