"""Action and ActionSchema representations."""
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Set, Dict, List, Tuple


@dataclass(frozen=True)
class Action:
    """
    A grounded (concrete) action instance.
    Immutable and hashable for use in search.
    """
    name: str  # Grounded action name, e.g., "pick-up(a)"
    schema_name: str  # Original schema name, e.g., "pick-up"
    preconditions: frozenset[str] = field(default_factory=frozenset)
    add_effects: frozenset[str] = field(default_factory=frozenset)
    del_effects: frozenset[str] = field(default_factory=frozenset)
    
    def is_applicable(self, state_preds: Set[str]) -> bool:
        """Check if action is applicable in a state."""
        return self.preconditions.issubset(state_preds)
    
    def apply(self, state_preds: Set[str]) -> Set[str]:
        """Apply action to state predicates, return new set."""
        return (state_preds | self.add_effects) - self.del_effects
    
    def __hash__(self) -> int:
        return hash((self.name, self.schema_name, 
                     self.preconditions, self.add_effects, self.del_effects))


@dataclass
class ActionSchema:
    """
    A lifted (parameterized) action schema.
    Contains variables that need to be grounded.
    """
    name: str
    parameters: List[Tuple[str, str]]  # [(var_name, type), ...]
    preconditions: List[Tuple[str, Tuple[str, ...]]]  # [(predicate_name, (args, ...)), ...]
    add_effects: List[Tuple[str, Tuple[str, ...]]]
    del_effects: List[Tuple[str, Tuple[str, ...]]]
    
    def ground(self, binding: Dict[str, str]) -> Action:
        """
        Ground this schema with a variable binding.
        binding: {var_name: object_name, ...}
        """
        # Substitute variables in preconditions
        grounded_pre = set()
        for pred, args in self.preconditions:
            grounded_args = tuple(binding.get(arg, arg) for arg in args)
            grounded_pre.add(self._format_predicate(pred, grounded_args))
        
        # Substitute variables in add effects
        grounded_add = set()
        for pred, args in self.add_effects:
            grounded_args = tuple(binding.get(arg, arg) for arg in args)
            grounded_add.add(self._format_predicate(pred, grounded_args))
        
        # Substitute variables in del effects
        grounded_del = set()
        for pred, args in self.del_effects:
            grounded_args = tuple(binding.get(arg, arg) for arg in args)
            grounded_del.add(self._format_predicate(pred, grounded_args))
        
        # Create grounded action name
        param_values = [binding[p[0]] for p in self.parameters]
        action_name = f"{self.name}({','.join(param_values)})"
        
        return Action(
            name=action_name,
            schema_name=self.name,
            preconditions=frozenset(grounded_pre),
            add_effects=frozenset(grounded_add),
            del_effects=frozenset(grounded_del)
        )
    
    @staticmethod
    def _format_predicate(name: str, args: Tuple[str, ...]) -> str:
        """Format predicate as string."""
        if args:
            return f"{name}({','.join(args)})"
        return name
