"""Immutable State representation using frozenset."""
from __future__ import annotations
from typing import Set, Iterable


class State:
    """
    Immutable state representation for STRIPS planning.
    Uses frozenset of predicate strings for hashability and efficient comparison.
    """
    
    def __init__(self, predicates: Iterable[str] | None = None):
        """Initialize state with a set of predicate strings."""
        self._predicates: frozenset[str] = frozenset(predicates) if predicates else frozenset()
        self._hash: int | None = None
    
    @property
    def predicates(self) -> frozenset[str]:
        """Get the frozenset of predicates."""
        return self._predicates
    
    def satisfies(self, condition: Set[str]) -> bool:
        """Check if state satisfies all predicates in condition."""
        return condition.issubset(self._predicates)
    
    def apply(self, add_effects: Set[str], del_effects: Set[str]) -> State:
        """Apply effects to create a new state (immutable)."""
        new_preds = (self._predicates | add_effects) - del_effects
        return State(new_preds)
    
    def is_goal(self, goal: Set[str]) -> bool:
        """Check if state satisfies the goal."""
        return goal.issubset(self._predicates)
    
    def __contains__(self, predicate: str) -> bool:
        """Check if predicate is in state."""
        return predicate in self._predicates
    
    def __hash__(self) -> int:
        """Hash based on frozenset."""
        if self._hash is None:
            self._hash = hash(self._predicates)
        return self._hash
    
    def __eq__(self, other: object) -> bool:
        """Equality comparison."""
        if not isinstance(other, State):
            return NotImplemented
        return self._predicates == other._predicates
    
    def __repr__(self) -> str:
        """String representation."""
        preds = sorted(self._predicates)
        if len(preds) > 10:
            return f"State({preds[:5]}...{preds[-5:]} ({len(preds)} predicates))"
        return f"State({preds})"
    
    def __len__(self) -> int:
        """Number of predicates."""
        return len(self._predicates)
    
    def copy(self) -> State:
        """Create a copy (returns self since immutable)."""
        return self
    
    def to_set(self) -> Set[str]:
        """Convert to regular set."""
        return set(self._predicates)
