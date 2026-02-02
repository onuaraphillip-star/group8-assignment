"""Pydantic models for API requests and responses."""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class PlanRequest(BaseModel):
    """Request body for plan endpoint."""
    domain_pddl: str = Field(..., description="PDDL domain definition")
    problem_pddl: str = Field(..., description="PDDL problem definition")
    algorithm: str = Field(default="astar", description="Search algorithm: bfs, astar, greedy")
    heuristic: str = Field(default="h_add", description="Heuristic: goal_count, h_add, h_max")
    timeout: int = Field(default=30, description="Timeout in seconds")


class ActionResult(BaseModel):
    """Single action in plan."""
    action: str
    preconditions: List[str]
    effects_add: List[str]
    effects_del: List[str]


class SearchMetrics(BaseModel):
    """Search performance metrics."""
    nodes_expanded: int
    nodes_generated: int
    plan_length: int
    search_time_ms: float
    heuristic_calls: int = 0
    initial_h: float = 0.0
    final_h: float = 0.0


class SearchTreeNode(BaseModel):
    """Node in search tree."""
    id: str
    state_hash: int
    heuristic: float
    depth: int
    g_cost: float
    is_goal: bool
    is_expanded: bool


class SearchTreeEdge(BaseModel):
    """Edge in search tree."""
    source: str
    target: str
    action: Optional[str]


class SearchTree(BaseModel):
    """Search tree visualization data."""
    nodes: List[SearchTreeNode]
    edges: List[SearchTreeEdge]


class PlanResponse(BaseModel):
    """Response from plan endpoint."""
    success: bool
    plan: List[ActionResult] = []
    metrics: Optional[SearchMetrics] = None
    search_tree: Optional[SearchTree] = None
    error_message: Optional[str] = None


class ValidationRequest(BaseModel):
    """Request body for validate endpoint."""
    domain_pddl: str
    problem_pddl: str
    plan: List[str]  # List of action names


class ValidationStep(BaseModel):
    """Single step in validation trace."""
    step: int
    state: List[str]
    action: Optional[str]
    action_applicable: Optional[bool]


class ValidationResponse(BaseModel):
    """Response from validate endpoint."""
    valid: bool
    error_step: Optional[int] = None
    error_message: Optional[str] = None
    final_state: Optional[List[str]] = None
    execution_trace: List[ValidationStep] = []


class BenchmarkInfo(BaseModel):
    """Information about a benchmark."""
    name: str
    domain: str
    description: str


class BenchmarksResponse(BaseModel):
    """Response from benchmarks endpoint."""
    benchmarks: List[BenchmarkInfo]
