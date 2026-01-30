"""
GeoMind 3.0 Database Models
Based on design document specifications
"""
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from .connection import Base


class StageStatus(str, enum.Enum):
    """Project stage status enumeration"""
    pending = "pending"
    in_progress = "in_progress"
    done = "done"


class MessageRole(str, enum.Enum):
    """Message role enumeration"""
    user = "user"
    assistant = "assistant"
    system = "system"


class Project(Base):
    """
    Project Model - Represents a research project
    A project contains multiple chats and has persistent memory
    """
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    topic = Column(Text, nullable=True)

    # Stage tracking - JSONB for flexibility
    stages = Column(JSON, default=lambda: {
        "literature": "pending",
        "gap": "pending",
        "methodology": "pending",
        "data_prep": "pending",
        "execution": "pending",
        "visualization": "pending",
        "results": "pending",
        "discussion": "pending",
        "references": "pending",
        "draft": "pending"
    })

    # Cross-chat memory - stores literature, methodology, results, etc.
    memory = Column(JSON, default=lambda: {
        "literature_list": [],
        "gap_selected": None,
        "methodology": None,
        "data_profile": None,
        "results_data": None,
        "figures": [],
        "tables": [],
        "sections": {
            "introduction": None,
            "methods": None,
            "results": None,
            "discussion": None
        }
    })

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    chats = relationship("Chat", back_populates="project", cascade="all, delete-orphan")
    files = relationship("File", back_populates="project", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Project {self.name}>"


class Chat(Base):
    """
    Chat Model - Represents a conversation within a project
    Can also exist without a project (quick chat)
    """
    __tablename__ = "chats"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=True)
    title = Column(String(255), default="New Chat")

    # Optional metadata
    chat_type = Column(String(50), default="general")  # general, literature, methodology, data, etc.

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    project = relationship("Project", back_populates="chats")
    messages = relationship("Message", back_populates="chat", cascade="all, delete-orphan", order_by="Message.created_at")

    def __repr__(self):
        return f"<Chat {self.title}>"


class Message(Base):
    """
    Message Model - Represents a single message in a chat
    """
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chat_id = Column(UUID(as_uuid=True), ForeignKey("chats.id", ondelete="CASCADE"), nullable=False)

    role = Column(Enum(MessageRole), nullable=False)
    content = Column(Text, nullable=False)

    # Artifacts - code blocks, literature, images, etc.
    artifacts = Column(JSON, default=list)

    # Optional metadata
    metadata = Column(JSON, default=dict)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    chat = relationship("Chat", back_populates="messages")

    def __repr__(self):
        return f"<Message {self.role}: {self.content[:50]}...>"


class File(Base):
    """
    File Model - Represents uploaded files associated with a project
    """
    __tablename__ = "files"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=True)

    filename = Column(String(255), nullable=False)
    file_type = Column(String(50))  # xlsx, csv, json, geojson, png, etc.
    file_path = Column(Text, nullable=False)  # Storage path
    file_size = Column(String(50))  # Human readable size

    # File metadata/preview
    preview = Column(JSON, default=dict)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    project = relationship("Project", back_populates="files")

    def __repr__(self):
        return f"<File {self.filename}>"
