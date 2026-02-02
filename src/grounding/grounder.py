"""Grounding engine for converting lifted actions to grounded actions."""
from __future__ import annotations
from itertools import product
from typing import Dict, List, Tuple, Any

from ..representations.domain import Domain
from ..representations.action import Action, ActionSchema
from ..representations.task import Task
from ..representations.state import State


class Grounder:
    """
    Grounds a lifted planning problem into a fully grounded task.
    """
    
    def __init__(self, domain: Domain, problem: dict):
        """
        Initialize grounder with domain and problem.
        
        Args:
            domain: Parsed Domain object
            problem: Problem dict with 'objects', 'initial_state', 'goal'
        """
        self.domain = domain
        self.objects = problem['objects']
        self.initial_state = problem['initial_state']
        self.goal = problem['goal']
        self.task_name = problem.get('name', 'task')
    
    def ground_task(self) -> Task:
        """
        Ground the entire task.
        Returns a Task with all grounded actions.
        """
        grounded_actions = []
        
        for schema_name, schema in self.domain.action_schemas.items():
            actions = self._ground_schema(schema)
            grounded_actions.extend(actions)
        
        return Task(
            name=self.task_name,
            domain_name=self.domain.name,
            objects=self.objects,
            initial_state=self.initial_state,
            goal=self.goal,
            actions=grounded_actions
        )
    
    def _ground_schema(self, schema: ActionSchema) -> List[Action]:
        """
        Ground a single action schema.
        Returns list of all possible grounded actions.
        """
        if not schema.parameters:
            # No parameters - single ground action
            binding = {}
            return [schema.ground(binding)]
        
        # Get possible objects for each parameter
        param_domains = []
        for param_name, param_type in schema.parameters:
            valid_objects = self._get_objects_of_type(param_type)
            param_domains.append([(param_name, obj) for obj in valid_objects])
        
        # Generate all combinations
        grounded_actions = []
        for combination in product(*param_domains):
            binding = {param_name: obj for param_name, obj in combination}
            try:
                action = schema.ground(binding)
                grounded_actions.append(action)
            except Exception:
                # Skip invalid groundings
                pass
        
        return grounded_actions
    
    def _get_objects_of_type(self, type_name: str) -> List[str]:
        """Get all objects of a given type (including subtypes and constants)."""
        result = []
        
        # Add objects from problem
        for obj_name, obj_type in self.objects.items():
            if obj_type == type_name:
                result.append(obj_name)
            elif self.domain.is_subtype(obj_type, type_name):
                result.append(obj_name)
        
        # Add constants from domain
        for const_name, const_type in self.domain.constants.items():
            if const_type == type_name:
                result.append(const_name)
            elif self.domain.is_subtype(const_type, type_name):
                result.append(const_name)
        
        return result
    
    def ground_state(self, lifted_preds: set) -> State:
        """Ground a lifted state representation."""
        # For now, predicates are already grounded in the problem
        return State(lifted_preds)
