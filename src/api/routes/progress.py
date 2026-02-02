"""User progress and statistics API routes."""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ...database import (
    get_user_progress, update_lesson_progress, get_completed_lessons_count,
    get_user_statistics, increment_plans_generated, increment_problems_solved,
    log_algorithm_usage, get_algorithm_usage_history, get_most_used_algorithm,
    update_favorite_algorithm
)
from .auth import get_current_active_user

router = APIRouter(prefix="/api/v1/progress", tags=["progress"])


class LessonProgressUpdate(BaseModel):
    completed: bool = True
    time_spent_seconds: int = 0


class AlgorithmUsage(BaseModel):
    algorithm: str
    heuristic: Optional[str] = None
    problem_name: Optional[str] = None
    nodes_expanded: int = 0
    plan_length: int = 0
    search_time_ms: float = 0.0


class UserStatsResponse(BaseModel):
    username: str
    total_plans_generated: int
    total_problems_solved: int
    total_nodes_expanded: int
    favorite_algorithm: Optional[str]
    completed_lessons: int


@router.get("/lessons", response_model=List[dict])
async def get_lessons_progress(current_user: dict = Depends(get_current_active_user)):
    """Get all lesson progress for current user."""
    return get_user_progress(current_user['username'])


@router.post("/lessons/{lesson_id}")
async def update_lesson(
    lesson_id: str,
    progress: LessonProgressUpdate,
    current_user: dict = Depends(get_current_active_user)
):
    """Update lesson progress."""
    update_lesson_progress(
        current_user['username'],
        lesson_id,
        progress.completed,
        progress.time_spent_seconds
    )
    return {"message": "Progress updated"}


@router.get("/stats", response_model=UserStatsResponse)
async def get_statistics(current_user: dict = Depends(get_current_active_user)):
    """Get user statistics."""
    stats = get_user_statistics(current_user['username'])
    completed = get_completed_lessons_count(current_user['username'])
    
    if not stats:
        raise HTTPException(status_code=404, detail="Statistics not found")
    
    return UserStatsResponse(
        username=current_user['username'],
        total_plans_generated=stats.get('total_plans_generated', 0),
        total_problems_solved=stats.get('total_problems_solved', 0),
        total_nodes_expanded=stats.get('total_nodes_expanded', 0),
        favorite_algorithm=stats.get('favorite_algorithm'),
        completed_lessons=completed
    )


@router.post("/plan-generated")
async def track_plan_generated(current_user: dict = Depends(get_current_active_user)):
    """Track that user generated a plan."""
    increment_plans_generated(current_user['username'])
    return {"message": "Tracked"}


@router.post("/problem-solved")
async def track_problem_solved(
    nodes_expanded: int = 0,
    current_user: dict = Depends(get_current_active_user)
):
    """Track that user solved a problem."""
    increment_problems_solved(current_user['username'], nodes_expanded)
    return {"message": "Tracked"}


@router.post("/algorithm-used")
async def track_algorithm_usage(
    usage: AlgorithmUsage,
    current_user: dict = Depends(get_current_active_user)
):
    """Log algorithm usage."""
    log_algorithm_usage(
        current_user['username'],
        usage.algorithm,
        usage.heuristic,
        usage.problem_name,
        usage.nodes_expanded,
        usage.plan_length,
        usage.search_time_ms
    )
    
    # Update favorite algorithm
    most_used = get_most_used_algorithm(current_user['username'])
    if most_used:
        update_favorite_algorithm(current_user['username'], most_used)
    
    return {"message": "Usage logged"}


@router.get("/algorithm-history", response_model=List[dict])
async def get_algorithm_history(
    limit: int = 10,
    current_user: dict = Depends(get_current_active_user)
):
    """Get recent algorithm usage history."""
    return get_algorithm_usage_history(current_user['username'], limit)
