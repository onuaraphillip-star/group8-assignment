"""Validation API routes."""
from fastapi import APIRouter, HTTPException

from ..models import ValidationRequest, ValidationResponse, ValidationStep
from ...parser.domain_parser import DomainParser
from ...parser.problem_parser import ProblemParser
from ...grounding.grounder import Grounder
from ...validator.plan_validator import PlanValidator

router = APIRouter(prefix="/api/v1", tags=["validation"])


@router.post("/validate", response_model=ValidationResponse)
async def validate(request: ValidationRequest):
    """
    Validate a plan against domain and problem.
    """
    try:
        # Parse domain
        domain_parser = DomainParser()
        domain = domain_parser.parse(request.domain_pddl)
        
        # Parse problem
        problem_parser = ProblemParser()
        problem = problem_parser.parse(request.problem_pddl)
        
        # Ground the task
        grounder = Grounder(domain, problem)
        task = grounder.ground_task()
        
        # Find actions by name
        plan = []
        for action_name in request.plan:
            found = False
            for action in task.actions:
                if action.name == action_name:
                    plan.append(action)
                    found = True
                    break
            if not found:
                return ValidationResponse(
                    valid=False,
                    error_step=len(plan),
                    error_message=f"Action '{action_name}' not found in domain"
                )
        
        # Validate
        validator = PlanValidator(task)
        result = validator.validate(plan)
        
        # Convert execution trace
        trace = []
        for step_data in (result.execution_trace or []):
            trace.append(ValidationStep(
                step=step_data['step'],
                state=step_data['state'],
                action=step_data['action'],
                action_applicable=step_data['action_applicable']
            ))
        
        return ValidationResponse(
            valid=result.valid,
            error_step=result.error_step,
            error_message=result.error_message,
            final_state=list(result.final_state.predicates) if result.final_state else None,
            execution_trace=trace
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
