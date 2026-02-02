"""User projects API routes."""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import uuid

from ...database import (
    create_project, get_user_projects, get_project, update_project, 
    delete_project, share_project, get_shared_project
)
from .auth import get_current_active_user

router = APIRouter(prefix="/api/v1/projects", tags=["projects"])


class ProjectCreate(BaseModel):
    project_name: str
    project_type: str  # 'domain' or 'problem'
    folder_path: str = ""
    content: str


class ProjectUpdate(BaseModel):
    content: str
    project_name: Optional[str] = None


class ProjectResponse(BaseModel):
    id: int
    project_name: str
    project_type: str
    folder_path: str
    content: str
    is_shared: bool
    share_id: Optional[str]
    created_at: str
    updated_at: str


@router.get("/", response_model=List[ProjectResponse])
async def list_projects(
    folder_path: str = "",
    current_user: dict = Depends(get_current_active_user)
):
    """List all projects for current user."""
    projects = get_user_projects(current_user['username'], folder_path)
    return [
        ProjectResponse(
            id=p['id'],
            project_name=p['project_name'],
            project_type=p['project_type'],
            folder_path=p['folder_path'],
            content=p['content'],
            is_shared=bool(p['is_shared']),
            share_id=p['share_id'],
            created_at=p['created_at'],
            updated_at=p['updated_at']
        )
        for p in projects
    ]


@router.post("/", response_model=dict)
async def create_new_project(
    project: ProjectCreate,
    current_user: dict = Depends(get_current_active_user)
):
    """Create a new project."""
    project_id = create_project(
        current_user['username'],
        project.project_name,
        project.project_type,
        project.content,
        project.folder_path
    )
    
    if not project_id:
        raise HTTPException(status_code=400, detail="Failed to create project")
    
    return {"id": project_id, "message": "Project created successfully"}


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project_by_id(
    project_id: int,
    current_user: dict = Depends(get_current_active_user)
):
    """Get a specific project."""
    project = get_project(project_id)
    
    if not project or project['username'] != current_user['username']:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return ProjectResponse(
        id=project['id'],
        project_name=project['project_name'],
        project_type=project['project_type'],
        folder_path=project['folder_path'],
        content=project['content'],
        is_shared=bool(project['is_shared']),
        share_id=project['share_id'],
        created_at=project['created_at'],
        updated_at=project['updated_at']
    )


@router.put("/{project_id}")
async def update_existing_project(
    project_id: int,
    update: ProjectUpdate,
    current_user: dict = Depends(get_current_active_user)
):
    """Update a project."""
    project = get_project(project_id)
    
    if not project or project['username'] != current_user['username']:
        raise HTTPException(status_code=404, detail="Project not found")
    
    success = update_project(
        project_id, 
        update.content, 
        update.project_name
    )
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to update project")
    
    return {"message": "Project updated successfully"}


@router.delete("/{project_id}")
async def delete_existing_project(
    project_id: int,
    current_user: dict = Depends(get_current_active_user)
):
    """Delete a project."""
    project = get_project(project_id)
    
    if not project or project['username'] != current_user['username']:
        raise HTTPException(status_code=404, detail="Project not found")
    
    success = delete_project(project_id)
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to delete project")
    
    return {"message": "Project deleted successfully"}


@router.post("/{project_id}/share")
async def share_existing_project(
    project_id: int,
    current_user: dict = Depends(get_current_active_user)
):
    """Generate a share link for a project."""
    project = get_project(project_id)
    
    if not project or project['username'] != current_user['username']:
        raise HTTPException(status_code=404, detail="Project not found")
    
    share_id = str(uuid.uuid4())[:8]
    success = share_project(project_id, share_id)
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to share project")
    
    return {"share_id": share_id, "share_url": f"/share/{share_id}"}


@router.get("/shared/{share_id}", response_model=ProjectResponse)
async def get_shared_project_by_id(share_id: str):
    """Get a shared project by share ID (public access)."""
    project = get_shared_project(share_id)
    
    if not project:
        raise HTTPException(status_code=404, detail="Shared project not found")
    
    return ProjectResponse(
        id=project['id'],
        project_name=project['project_name'],
        project_type=project['project_type'],
        folder_path=project['folder_path'],
        content=project['content'],
        is_shared=bool(project['is_shared']),
        share_id=project['share_id'],
        created_at=project['created_at'],
        updated_at=project['updated_at']
    )
