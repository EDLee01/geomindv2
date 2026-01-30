"""
Chat API Router (Enhanced for GeoMind 3.0)
Handles chat CRUD and AI conversation with database persistence
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Optional, List
from uuid import UUID

from ..database import get_db, Chat, Message, Project
from ..schemas.chat import (
    ChatCreate,
    ChatUpdate,
    ChatResponse,
    ChatListResponse,
    MessageResponse,
    SendMessageRequest,
    SendMessageResponse
)
from ..services.claude import claude_service
from ..services.qdrant import qdrant_service
from ..services.intent import detect_intent
from ..services.skills import get_skill_prompt

router = APIRouter()


def message_to_response(message: Message) -> MessageResponse:
    """Convert Message model to response schema."""
    return MessageResponse(
        id=message.id,
        role=message.role.value if hasattr(message.role, 'value') else message.role,
        content=message.content,
        artifacts=message.artifacts or [],
        created_at=message.created_at
    )


def chat_to_response(chat: Chat, include_messages: bool = False) -> ChatResponse:
    """Convert Chat model to response schema."""
    return ChatResponse(
        id=chat.id,
        project_id=chat.project_id,
        title=chat.title,
        chat_type=chat.chat_type or "general",
        created_at=chat.created_at,
        updated_at=chat.updated_at,
        messages=[message_to_response(m) for m in chat.messages] if include_messages and chat.messages else [],
        message_count=len(chat.messages) if chat.messages else 0
    )


@router.get("", response_model=ChatListResponse)
async def list_chats(
    project_id: Optional[UUID] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    Get all chats, optionally filtered by project.

    - **project_id**: Filter by project (optional)
    - **skip**: Pagination offset
    - **limit**: Maximum results
    """
    query = db.query(Chat)

    if project_id:
        query = query.filter(Chat.project_id == project_id)
    else:
        # Show chats without project (quick chats)
        query = query.filter(Chat.project_id.is_(None))

    chats = query.order_by(Chat.updated_at.desc()).offset(skip).limit(limit).all()
    total = query.count()

    return ChatListResponse(
        chats=[chat_to_response(c) for c in chats],
        total=total
    )


@router.post("", response_model=ChatResponse)
async def create_chat(
    chat: ChatCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new chat.

    - **project_id**: Associate with project (optional)
    - **title**: Chat title
    - **chat_type**: Type of chat (general, literature, methodology, etc.)
    """
    # Verify project exists if provided
    if chat.project_id:
        project = db.query(Project).filter(Project.id == chat.project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

    db_chat = Chat(
        project_id=chat.project_id,
        title=chat.title,
        chat_type=chat.chat_type
    )
    db.add(db_chat)
    db.commit()
    db.refresh(db_chat)

    return chat_to_response(db_chat)


@router.get("/{chat_id}", response_model=ChatResponse)
async def get_chat(
    chat_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get a specific chat with all messages.

    - **chat_id**: Chat UUID
    """
    chat = db.query(Chat).filter(Chat.id == chat_id).first()

    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    return chat_to_response(chat, include_messages=True)


@router.put("/{chat_id}", response_model=ChatResponse)
async def update_chat(
    chat_id: UUID,
    chat_update: ChatUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a chat.

    - **chat_id**: Chat UUID
    - **title**: New title
    - **chat_type**: New chat type
    """
    chat = db.query(Chat).filter(Chat.id == chat_id).first()

    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    if chat_update.title is not None:
        chat.title = chat_update.title
    if chat_update.chat_type is not None:
        chat.chat_type = chat_update.chat_type

    db.commit()
    db.refresh(chat)

    return chat_to_response(chat)


@router.delete("/{chat_id}")
async def delete_chat(
    chat_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Delete a chat and all its messages.

    - **chat_id**: Chat UUID
    """
    chat = db.query(Chat).filter(Chat.id == chat_id).first()

    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    db.delete(chat)
    db.commit()

    return {"message": "Chat deleted successfully"}


@router.post("/{chat_id}/messages", response_model=SendMessageResponse)
async def send_message(
    chat_id: UUID,
    request: SendMessageRequest,
    db: Session = Depends(get_db)
):
    """
    Send a message and get AI response.

    - **chat_id**: Chat UUID
    - **content**: Message content
    - **search_literature**: Enable literature search
    - **file_context**: File data context
    - **project_id**: Project for memory access
    - **skills**: Skills to activate
    """
    chat = db.query(Chat).filter(Chat.id == chat_id).first()

    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    # Detect intent
    intent = detect_intent(request.content)

    # Save user message
    user_message = Message(
        chat_id=chat_id,
        role="user",
        content=request.content
    )
    db.add(user_message)
    db.commit()
    db.refresh(user_message)

    # Get project memory if available
    project_memory = None
    if chat.project_id:
        project = db.query(Project).filter(Project.id == chat.project_id).first()
        if project:
            project_memory = project.memory

    # Search literature if enabled
    literature = []
    if request.search_literature:
        try:
            papers = await qdrant_service.get_related_papers(
                text=request.content,
                limit=5
            )
            literature = [
                {
                    "title": paper.get("title", ""),
                    "author_display": paper.get("author_display", ""),
                    "year": paper.get("year"),
                    "journal": paper.get("journal", ""),
                    "doi": paper.get("doi", ""),
                    "score": paper.get("score", 0)
                }
                for paper in papers
            ]
        except Exception as e:
            print(f"Literature search failed: {e}")

    # Build system prompt
    system_prompt = claude_service.get_geomind_system_prompt(
        file_context=request.file_context,
        project_memory=project_memory,
        skills=request.skills
    )

    # Add literature context
    if literature:
        lit_context = "\n\nRelated literature for reference:\n"
        for i, paper in enumerate(literature, 1):
            lit_context += f"[{i}] {paper['author_display']} ({paper['year']}). {paper['title']}. {paper['journal']}.\n"
            if paper.get('doi'):
                lit_context += f"    DOI: {paper['doi']}\n"
        system_prompt += lit_context

    # Get conversation history
    messages_history = [
        {"role": m.role.value if hasattr(m.role, 'value') else m.role, "content": m.content}
        for m in chat.messages[-10:]  # Last 10 messages for context
    ]

    # Get AI response
    response = await claude_service.chat_completion(
        messages=messages_history,
        system_prompt=system_prompt
    )

    if "error" in response:
        raise HTTPException(
            status_code=500,
            detail=f"AI service error: {response['error']}"
        )

    # Extract artifacts from response
    artifacts = extract_artifacts(response["content"])

    # Save assistant message
    assistant_message = Message(
        chat_id=chat_id,
        role="assistant",
        content=response["content"],
        artifacts=artifacts
    )
    db.add(assistant_message)

    # Update chat title if first message
    if len(chat.messages) <= 2:
        # Generate title from first message
        chat.title = request.content[:50] + "..." if len(request.content) > 50 else request.content

    db.commit()
    db.refresh(assistant_message)

    return SendMessageResponse(
        user_message=message_to_response(user_message),
        assistant_message=message_to_response(assistant_message),
        literature=literature,
        artifacts=[],  # Parsed artifacts
        intent=intent,
        suggested_skills=get_suggested_skills(intent, request.content)
    )


def extract_artifacts(content: str) -> List[dict]:
    """Extract code blocks and other artifacts from response content."""
    import re
    artifacts = []

    # Extract code blocks
    code_pattern = r'```(\w+)?\n(.*?)```'
    matches = re.findall(code_pattern, content, re.DOTALL)

    for i, (lang, code) in enumerate(matches):
        artifacts.append({
            "id": f"code_{i}",
            "type": "code",
            "title": f"Code Block {i+1}",
            "content": code.strip(),
            "language": lang or "python"
        })

    return artifacts


def get_suggested_skills(intent: str, content: str) -> List[str]:
    """Get suggested skills based on intent and content."""
    content_lower = content.lower()

    suggestions = []

    if "文献" in content_lower or "literature" in content_lower or "paper" in content_lower:
        suggestions.append("literature_search")
    if "gap" in content_lower or "空白" in content_lower:
        suggestions.append("gap_analysis")
    if "方案" in content_lower or "methodology" in content_lower:
        suggestions.append("methodology_design")
    if "数据" in content_lower or "data" in content_lower:
        suggestions.append("data_preprocess")
    if "图" in content_lower or "plot" in content_lower or "figure" in content_lower:
        suggestions.append("visualization")
    if "results" in content_lower or "结果" in content_lower:
        suggestions.append("results_writing")
    if "discussion" in content_lower or "讨论" in content_lower:
        suggestions.append("discussion_writing")

    return suggestions
