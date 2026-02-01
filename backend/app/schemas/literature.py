"""
Literature Schemas
"""
from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List
from enum import Enum


class ExportFormat(str, Enum):
    """Export format options"""
    bibtex = "bibtex"
    ris = "ris"


class PaperResponse(BaseModel):
    """Schema for a single paper"""
    id: str
    title: str
    authors: List[str]
    year: int
    journal: str
    abstract: Optional[str] = None
    doi: Optional[str] = None
    citations: int = 0
    impact_factor: Optional[float] = None
    cas_zone: Optional[str] = None
    # Search metadata
    score: Optional[float] = None
    search_reason: Optional[str] = None
    # Verification status
    verified: Optional[bool] = None


class LiteratureSearchRequest(BaseModel):
    """Schema for literature search request"""
    query: str = Field(..., min_length=1)
    limit: int = Field(default=20, ge=1, le=50)
    year_from: Optional[int] = None
    year_to: Optional[int] = None
    min_citations: Optional[int] = None
    journals: Optional[List[str]] = None
    # Auto verification
    auto_verify: bool = True


class LiteratureSearchResponse(BaseModel):
    """Schema for literature search response"""
    papers: List[PaperResponse]
    total: int
    query: str
    verified_count: int = 0
    removed_count: int = 0
    message: Optional[str] = None


class VerifyRequest(BaseModel):
    """Schema for DOI verification request"""
    dois: List[str] = Field(..., min_length=1)


class VerifyResult(BaseModel):
    """Single verification result"""
    doi: str
    valid: bool
    title: Optional[str] = None
    error: Optional[str] = None


class VerifyResponse(BaseModel):
    """Schema for verification response"""
    results: List[VerifyResult]
    valid_count: int
    invalid_count: int


class ExportRequest(BaseModel):
    """Schema for export request"""
    paper_ids: List[str]
    format: ExportFormat = ExportFormat.bibtex


class ExportResponse(BaseModel):
    """Schema for export response"""
    content: str
    format: ExportFormat
    count: int
