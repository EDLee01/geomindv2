"""
File Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID


class FilePreview(BaseModel):
    """Preview data for uploaded file"""
    rows: int
    columns: int
    column_names: List[str]
    head: List[Dict[str, Any]]
    dtypes: Dict[str, str]


class FileUploadResponse(BaseModel):
    """Schema for file upload response"""
    id: UUID
    filename: str
    file_type: str
    file_size: str
    preview: Optional[FilePreview] = None
    created_at: datetime

    class Config:
        from_attributes = True


class FileInfoResponse(BaseModel):
    """Schema for file info response"""
    id: UUID
    project_id: Optional[UUID]
    filename: str
    file_type: str
    file_path: str
    file_size: str
    preview: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True


class FileListResponse(BaseModel):
    """Schema for file list response"""
    files: List[FileInfoResponse]
    total: int
