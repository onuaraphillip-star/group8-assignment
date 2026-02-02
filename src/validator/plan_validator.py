"""Plan validator for verifying plan correctness."""
from __future__ import annotations
from dataclasses import dataclass
from typing import List, Optional, Dict, Any

from ..representations.state import State
from ..representations.action import Action
from ..representations.task import Task


@dataclass
class ValidationResult:
    """Result of plan validation."""
    valid: bool
    error_step: Optional[int] = None
    error_message: Optional[str] = None
    final_state: Optional[State] = None
    execution_trace: List[Dict[str, Any]] = None
    
    def to_dict(self) -> dict:
        """Convert to dictionary."""
        return {
            'valid': self.valid,
            'error_step': self.error_step,
            'error_message': self.error_message,
            'final_state': list(self.final_state.predicates) if self.final_state else None,
            'execution_trace': self.execution_trace
        }


class PlanValidator:
    """Validates plans by simulation."""
    
    def __init__(self, task: Task):
        """
        Initialize validator with task.
        
        Args:
            task: The planning task
        """
        self.task = task
    
    def validate(self, plan: List[Action]) -> ValidationResult:
        """
        Validate a plan by simulation.
        
        Args:
            plan: List of actions to validate
            
        Returns:
            ValidationResult with details
        """
        current_state = self.task.initial_state
        execution_trace = []
        
        # Record initial state
        execution_trace.append({
            'step': 0,
            'state': sorted(current_state.predicates),
            'action': None,
            'action_applicable': None
        })
        
        for step, action in enumerate(plan):
            # Check if action is applicable
            if not action.is_applicable(current_state.predicates):
                return ValidationResult(
                    valid=False,
                    error_step=step,
                    error_message=f"Action '{action.name}' not applicable in step {step}",
                    final_state=current_state,
                    execution_trace=execution_trace
                )
            
            # Apply action
            new_preds = action.apply(current_state.predicates)
            current_state = State(new_preds)
            
            # Record step
            execution_trace.append({
                'step': step + 1,
                'state': sorted(current_state.predicates),
                'action': action.name,
                'action_applicable': True
            })
        
        # Check if goal is satisfied
        if not self.task.is_goal_reached(current_state):
            missing = self.task.goal - current_state.predicates
            return ValidationResult(
                valid=False,
                error_step=len(plan),
                error_message=f"Goal not reached. Missing: {missing}",
                final_state=current_state,
                execution_trace=execution_trace
            )
        
        return ValidationResult(
            valid=True,
            final_state=current_state,
            execution_trace=execution_trace
        )
    
    def validate_plan_string(self, plan_text: str) -> ValidationResult:
        """
        Validate a plan from string format.
        
        Format: one action per line, e.g.:
            pick-up(a)
            stack(a,b)
        """
        lines = [line.strip() for line in plan_text.strip().split('\n') if line.strip()]
        
        # Parse actions
        plan = []
        for line in lines:
            # Remove comments
            if ';' in line:
                line = line[:line.index(';')].strip()
            
            # Find matching action
            action = self._find_action(line)
            if action is None:
                return ValidationResult(
                    valid=False,
                    error_step=len(plan),
                    error_message=f"Unknown action: {line}",
                    execution_trace=[]
                )
            plan.append(action)
        
        return self.validate(plan)
    
    def _find_action(self, action_name: str) -> Optional[Action]:
        """Find action by name in task."""
        for action in self.task.actions:
            if action.name == action_name:
                return action
        # Try without exact match - just schema name
        for action in self.task.actions:
            if action.name.startswith(action_name.split('(')[0]):
                return action
        return None
