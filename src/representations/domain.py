"""Domain representation."""
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Dict, List, Set, Tuple
from .action import ActionSchema


@dataclass
class Domain:
    """
    PDDL Domain representation.
    Contains types, predicates, and action schemas.
    """
    name: str
    requirements: List[str] = field(default_factory=list)
    types: Dict[str, str | None] = field(default_factory=dict)  # type -> parent (None for root)
    predicates: Dict[str, List[str]] = field(default_factory=dict)  # name -> arg types
    constants: Dict[str, str] = field(default_factory=dict)  # name -> type
    action_schemas: Dict[str, ActionSchema] = field(default_factory=dict)
    
    def get_type_hierarchy(self, type_name: str) -> List[str]:
        """Get all types in hierarchy from type_name up to root."""
        hierarchy = [type_name]
        current = type_name
        while current in self.types and self.types[current] is not None:
            current = self.types[current]
            hierarchy.append(current)
        return hierarchy
    
    def is_subtype(self, subtype: str, supertype: str) -> bool:
        """Check if subtype is a subtype of supertype."""
        return supertype in self.get_type_hierarchy(subtype)
    
    def get_objects_of_type(self, objects: Dict[str, str], type_name: str) -> List[str]:
        """Get all objects of a given type (including subtypes)."""
        result = []
        for obj_name, obj_type in objects.items():
            if obj_type == type_name or self.is_subtype(obj_type, type_name):
                result.append(obj_name)
        return result
