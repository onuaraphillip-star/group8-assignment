"""Domain/benchmark API routes."""
import json
from pathlib import Path
from fastapi import APIRouter

from ..models import BenchmarksResponse, BenchmarkInfo

router = APIRouter(prefix="/api/v1", tags=["domains"])

# Path to benchmarks directory
BENCHMARKS_DIR = Path(__file__).parent.parent.parent.parent / "benchmarks"


@router.get("/benchmarks", response_model=BenchmarksResponse)
async def list_benchmarks():
    """
    List available benchmarks.
    """
    benchmarks = []
    
    if BENCHMARKS_DIR.exists():
        # Scan for domain files
        for domain_file in sorted(BENCHMARKS_DIR.glob("*/domain.pddl")):
            domain_name = domain_file.parent.name
            
            # Find problems in this domain
            problem_files = sorted(domain_file.parent.glob("problem*.pddl"))
            
            for problem_file in problem_files:
                problem_name = problem_file.stem
                benchmarks.append(BenchmarkInfo(
                    name=problem_name,
                    domain=domain_name,
                    description=f"{domain_name} - {problem_name}"
                ))
    
    return BenchmarksResponse(benchmarks=benchmarks)


@router.get("/benchmarks/{domain_name}/{problem_name}")
async def get_benchmark(domain_name: str, problem_name: str):
    """
    Get a specific benchmark's PDDL files.
    """
    domain_path = BENCHMARKS_DIR / domain_name / "domain.pddl"
    problem_path = BENCHMARKS_DIR / domain_name / f"{problem_name}.pddl"
    
    if not domain_path.exists():
        return {"error": f"Domain '{domain_name}' not found"}
    
    if not problem_path.exists():
        # Try with problem prefix
        problem_path = BENCHMARKS_DIR / domain_name / f"problem-{problem_name}.pddl"
        if not problem_path.exists():
            return {"error": f"Problem '{problem_name}' not found in domain '{domain_name}'"}
    
    return {
        "domain": domain_path.read_text(),
        "problem": problem_path.read_text()
    }
