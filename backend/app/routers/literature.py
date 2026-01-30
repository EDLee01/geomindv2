"""
Literature API Router
Handles paper search and retrieval
"""
from fastapi import APIRouter, Query
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

from ..services.qdrant import qdrant_service

router = APIRouter()


class Paper(BaseModel):
    """Paper model for API response."""
    id: str
    title: str
    authors: List[str]
    author_display: str
    year: Optional[int]
    journal: str
    abstract: str
    citations: int
    score: float
    openalex_url: str
    impact_factor: Optional[float] = None
    cas_zone: Optional[str] = None
    is_top: bool = False


class SearchResponse(BaseModel):
    """Literature search response."""
    total: int
    query: str
    papers: List[Dict[str, Any]]


@router.get("/search", response_model=SearchResponse)
async def search_literature(
    q: str = Query(..., description="Search query"),
    limit: int = Query(15, ge=1, le=50, description="Maximum results"),
    year_from: Optional[int] = Query(None, description="Filter by minimum year"),
    year_to: Optional[int] = Query(None, description="Filter by maximum year"),
    min_citations: Optional[int] = Query(None, ge=0, description="Minimum citation count")
):
    """
    Search for scientific papers using semantic similarity.

    - **q**: Search query (required)
    - **limit**: Maximum number of results (1-50, default 15)
    - **year_from**: Filter papers published after this year
    - **year_to**: Filter papers published before this year
    - **min_citations**: Filter by minimum citation count
    """
    result = await qdrant_service.search_papers(
        query=q,
        limit=limit,
        year_from=year_from,
        year_to=year_to,
        min_citations=min_citations
    )

    # Transform papers to include openalex_url from doi
    papers = []
    for paper in result.get("papers", []):
        papers.append({
            **paper,
            "openalex_url": paper.get("doi", "")  # DOI is already full URL
        })

    return SearchResponse(
        total=result.get("total", 0),
        query=result.get("query", q),
        papers=papers
    )


@router.get("/paper/{paper_id}")
async def get_paper(paper_id: str):
    """
    Get details of a specific paper by ID.

    - **paper_id**: Paper ID from search results
    """
    # For now, return a placeholder since Qdrant doesn't support get by ID easily
    # In production, you might want to store paper details in a separate database
    return {
        "id": paper_id,
        "message": "Paper details endpoint - implement with database lookup"
    }
