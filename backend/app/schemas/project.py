"""
Project Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID


class ProjectStages(BaseModel):
    """Project stage status tracking"""
    literature: str = "pending"
    gap: str = "pending"
    methodology: str = "pending"
    data_prep: str = "pending"
    execution: str = "pending"
    visualization: str = "pending"
    results: str = "pending"
    discussion: str = "pending"
    references: str = "pending"
    draft: str = "pending"


class SectionContent(BaseModel):
    """Content for paper sections"""
    introduction: Optional[str] = None
    methods: Optional[str] = None
    results: Optional[str] = None
    discussion: Optional[str] = None


class ProjectMemory(BaseModel):
    """Cross-chat persistent memory"""
    literature_list: List[Dict[str, Any]] = Field(default_factory=list)
    gap_selected: Optional[str] = None
    methodology: Optional[Dict[str, Any]] = None
    data_profile: Optional[Dict[str, Any]] = None
    results_data: Optional[Dict[str, Any]] = None
    figures: List[Dict[str, Any]] = Field(default_factory=list)
    tables: List[Dict[str, Any]] = Field(default_factory=list)
    sections: SectionContent = Field(default_factory=SectionContent)


class ProjectCreate(BaseModel):
    """Schema for creating a new project"""
    name: str = Field(..., min_length=1, max_length=255)
    topic: Optional[str] = None


class ProjectUpdate(BaseModel):
    """Schema for updating a project"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    topic: Optional[str] = None
    stages: Optional[ProjectStages] = None
    memory: Optional[ProjectMemory] = None


class ProjectResponse(BaseModel):
    """Schema for project response"""
    id: UUID
    name: str
    topic: Optional[str]
    stages: Dict[str, str]
    memory: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    chat_count: int = 0
    file_count: int = 0

    class Config:
        from_attributes = True


class ProjectListResponse(BaseModel):
    """Schema for project list response"""
    projects: List[ProjectResponse]
    total: int
