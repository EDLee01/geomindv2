"""
Project API Router
Handles project CRUD operations and memory management
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID

from ..database import get_db, Project, Chat, User
from ..schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    ProjectListResponse
)
from ..services.auth import get_current_user

router = APIRouter()


def project_to_response(project: Project) -> ProjectResponse:
    """Convert Project model to response schema."""
    return ProjectResponse(
        id=project.id,
        name=project.name,
        topic=project.topic,
        stages=project.stages or {},
        memory=project.memory or {},
        created_at=project.created_at,
        updated_at=project.updated_at,
        chat_count=len(project.chats) if project.chats else 0,
        file_count=len(project.files) if project.files else 0
    )


@router.get("", response_model=ProjectListResponse)
async def list_projects(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Get all projects for the current user.
    If not authenticated, returns empty list.

    - **skip**: Number of records to skip (pagination)
    - **limit**: Maximum records to return
    """
    if not current_user:
        return ProjectListResponse(projects=[], total=0)

    query = db.query(Project).filter(Project.user_id == current_user.id)
    projects = query.order_by(Project.updated_at.desc()).offset(skip).limit(limit).all()
    total = query.count()

    return ProjectListResponse(
        projects=[project_to_response(p) for p in projects],
        total=total
    )


@router.post("", response_model=ProjectResponse)
async def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Create a new project.

    - **name**: Project name (required)
    - **topic**: Research topic (optional)
    """
    db_project = Project(
        name=project.name,
        topic=project.topic,
        user_id=current_user.id if current_user else None
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)

    return project_to_response(db_project)


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Get a specific project by ID including its memory.

    - **project_id**: Project UUID
    """
    query = db.query(Project).filter(Project.id == project_id)

    # If authenticated, only allow access to own projects
    if current_user:
        query = query.filter(Project.user_id == current_user.id)

    project = query.first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return project_to_response(project)


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: UUID,
    project_update: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Update a project.

    - **project_id**: Project UUID
    - **name**: New project name
    - **topic**: New research topic
    - **stages**: Updated stage statuses
    - **memory**: Updated project memory
    """
    query = db.query(Project).filter(Project.id == project_id)

    if current_user:
        query = query.filter(Project.user_id == current_user.id)

    project = query.first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Update fields if provided
    if project_update.name is not None:
        project.name = project_update.name
    if project_update.topic is not None:
        project.topic = project_update.topic
    if project_update.stages is not None:
        project.stages = project_update.stages.model_dump()
    if project_update.memory is not None:
        project.memory = project_update.memory.model_dump()

    db.commit()
    db.refresh(project)

    return project_to_response(project)


@router.delete("/{project_id}")
async def delete_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Delete a project and all its chats/files.

    - **project_id**: Project UUID
    """
    query = db.query(Project).filter(Project.id == project_id)

    if current_user:
        query = query.filter(Project.user_id == current_user.id)

    project = query.first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    db.delete(project)
    db.commit()

    return {"message": "Project deleted successfully"}


@router.patch("/{project_id}/memory")
async def update_project_memory(
    project_id: UUID,
    memory_update: dict,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Partially update project memory.
    Merges the provided fields with existing memory.

    - **project_id**: Project UUID
    - **memory_update**: Fields to update/add to memory
    """
    query = db.query(Project).filter(Project.id == project_id)

    if current_user:
        query = query.filter(Project.user_id == current_user.id)

    project = query.first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Merge with existing memory
    current_memory = project.memory or {}
    current_memory.update(memory_update)
    project.memory = current_memory

    db.commit()
    db.refresh(project)

    return {"message": "Memory updated successfully", "memory": project.memory}


@router.patch("/{project_id}/stages")
async def update_project_stages(
    project_id: UUID,
    stages_update: dict,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Update project stage statuses.

    - **project_id**: Project UUID
    - **stages_update**: Stage names and their new statuses
    """
    query = db.query(Project).filter(Project.id == project_id)

    if current_user:
        query = query.filter(Project.user_id == current_user.id)

    project = query.first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Merge with existing stages
    current_stages = project.stages or {}
    current_stages.update(stages_update)
    project.stages = current_stages

    db.commit()
    db.refresh(project)

    return {"message": "Stages updated successfully", "stages": project.stages}


@router.get("/{project_id}/chats")
async def get_project_chats(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Get all chats for a project.

    - **project_id**: Project UUID
    """
    query = db.query(Project).filter(Project.id == project_id)

    if current_user:
        query = query.filter(Project.user_id == current_user.id)

    project = query.first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    chats = db.query(Chat).filter(Chat.project_id == project_id).order_by(Chat.created_at.desc()).all()

    return {
        "chats": [
            {
                "id": str(chat.id),
                "title": chat.title,
                "chat_type": chat.chat_type,
                "created_at": chat.created_at.isoformat(),
                "message_count": len(chat.messages) if chat.messages else 0
            }
            for chat in chats
        ],
        "total": len(chats)
    }
