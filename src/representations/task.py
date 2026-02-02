"""Grounded planning task representation."""
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Dict, List, Set
from .state import State
from .action import Action


@dataclass
class Task:
    """
    A fully grounded planning task.
    Contains initial state, goal, and all grounded actions.
    """
    name: str
    domain_name: str
    objects: Dict[str, str]  # object name -> type
    initial_state: State
    goal: Set[str]
    actions: List[Action] = field(default_factory=list)
    
    def get_applicable_actions(self, state: State) -> List[Action]:
        """Get all actions applicable in the given state."""
        state_preds = state.predicates
        return [a for a in self.actions if a.is_applicable(state_preds)]
    
    def is_goal_reached(self, state: State) -> bool:
        """Check if goal is satisfied."""
        return state.is_goal(self.goal)
