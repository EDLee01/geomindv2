"""
Chat API Router
Handles conversation with Claude AI
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from ..services.claude import claude_service
from ..services.qdrant import qdrant_service

router = APIRouter()


class Message(BaseModel):
    """Chat message model."""
    role: str  # 'user' or 'assistant'
    content: str


class ChatRequest(BaseModel):
    """Chat completion request model."""
    messages: List[Message]
    search_literature: bool = True
    file_context: Optional[str] = None


class LiteratureItem(BaseModel):
    """Literature reference in response."""
    title: str
    author_display: str
    year: Optional[int]
    journal: str
    openalex_url: str


class ChatResponse(BaseModel):
    """Chat completion response model."""
    content: str
    literature: List[Dict[str, Any]] = []


@router.post("/completions", response_model=ChatResponse)
async def chat_completions(request: ChatRequest):
    """
    Send a chat message and get AI response with optional literature.

    - **messages**: Conversation history
    - **search_literature**: Whether to search for related papers
    - **file_context**: Optional file data summary to include in context
    """
    if not request.messages:
        raise HTTPException(status_code=400, detail="Messages cannot be empty")

    # Get the latest user message for literature search
    latest_message = request.messages[-1].content if request.messages else ""

    # Search for related literature if enabled
    literature = []
    if request.search_literature and latest_message:
        try:
            papers = await qdrant_service.get_related_papers(
                text=latest_message,
                limit=3
            )
            literature = [
                {
                    "title": paper.get("title", ""),
                    "author_display": paper.get("author_display", ""),
                    "year": paper.get("year"),
                    "journal": paper.get("journal", ""),
                    "openalex_url": paper.get("doi", ""),  # DOI is already full URL
                    "score": paper.get("score", 0)
                }
                for paper in papers
            ]
        except Exception as e:
            # Continue without literature if search fails
            print(f"Literature search failed: {e}")

    # Build system prompt
    system_prompt = claude_service.get_geomind_system_prompt(
        file_context=request.file_context
    )

    # Add literature context if available
    if literature:
        lit_context = "\n\nRelated literature for reference:\n"
        for i, paper in enumerate(literature, 1):
            lit_context += f"[{i}] {paper['author_display']} ({paper['year']}). {paper['title']}. {paper['journal']}.\n"
        system_prompt += lit_context

    # Convert messages to dict format
    messages_dict = [
        {"role": msg.role, "content": msg.content}
        for msg in request.messages
    ]

    # Get response from Claude
    response = await claude_service.chat_completion(
        messages=messages_dict,
        system_prompt=system_prompt
    )

    if "error" in response:
        raise HTTPException(
            status_code=500,
            detail=f"AI service error: {response['error']}"
        )

    return ChatResponse(
        content=response["content"],
        literature=literature
    )
