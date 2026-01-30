"""
Chat and Message Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from enum import Enum


class ArtifactType(str, Enum):
    """Types of artifacts that can be attached to messages"""
    markdown = "markdown"
    code = "code"
    image = "image"
    table = "table"
    bibtex = "bibtex"
    references = "references"


class ArtifactResponse(BaseModel):
    """Schema for message artifacts"""
    id: str
    type: ArtifactType
    title: str
    content: str
    language: Optional[str] = None  # For code artifacts


class MessageCreate(BaseModel):
    """Schema for creating a message"""
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str
    artifacts: List[Dict[str, Any]] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class MessageResponse(BaseModel):
    """Schema for message response"""
    id: UUID
    role: str
    content: str
    artifacts: List[Dict[str, Any]]
    created_at: datetime

    class Config:
        from_attributes = True


class ChatCreate(BaseModel):
    """Schema for creating a chat"""
    project_id: Optional[UUID] = None
    title: Optional[str] = "New Chat"
    chat_type: Optional[str] = "general"


class ChatUpdate(BaseModel):
    """Schema for updating a chat"""
    title: Optional[str] = None
    chat_type: Optional[str] = None


class ChatResponse(BaseModel):
    """Schema for chat response"""
    id: UUID
    project_id: Optional[UUID]
    title: str
    chat_type: str
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse] = Field(default_factory=list)
    message_count: int = 0

    class Config:
        from_attributes = True


class ChatListResponse(BaseModel):
    """Schema for chat list response"""
    chats: List[ChatResponse]
    total: int


class SendMessageRequest(BaseModel):
    """Schema for sending a message and getting AI response"""
    content: str = Field(..., min_length=1)
    # Optional context
    search_literature: bool = False
    file_context: Optional[str] = None
    # Project context
    project_id: Optional[UUID] = None
    # Skills to activate
    skills: List[str] = Field(default_factory=list)


class SendMessageResponse(BaseModel):
    """Schema for message response from AI"""
    user_message: MessageResponse
    assistant_message: MessageResponse
    # Optional additional data
    literature: List[Dict[str, Any]] = Field(default_factory=list)
    artifacts: List[ArtifactResponse] = Field(default_factory=list)
    # Intent detection result
    intent: Optional[str] = None  # chat, task, project
    suggested_skills: List[str] = Field(default_factory=list)
