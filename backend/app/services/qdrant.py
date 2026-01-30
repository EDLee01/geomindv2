"""
Qdrant Vector Database Service
For literature search and retrieval
"""
from qdrant_client import QdrantClient
from qdrant_client.http.models import Filter, FieldCondition, Range, MatchValue
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any, Optional
from ..config import settings


class QdrantService:
    """Service for vector search in Qdrant database."""

    def __init__(self):
        self.client = QdrantClient(
            url=settings.QDRANT_URL,
            api_key=settings.QDRANT_API_KEY,
            timeout=30
        )
        self.collection = settings.QDRANT_COLLECTION
        # Use BAAI/bge-base-en-v1.5 as specified - 768 dimensions
        self._model = None

    @property
    def model(self):
        """Lazy load the embedding model."""
        if self._model is None:
            self._model = SentenceTransformer('BAAI/bge-base-en-v1.5')
        return self._model

    def encode_query(self, text: str) -> List[float]:
        """
        Encode text to vector using BGE model.

        Args:
            text: Search query text

        Returns:
            List of floats (768 dimensions)
        """
        return self.model.encode(text).tolist()

    async def search_papers(
        self,
        query: str,
        limit: int = 15,
        year_from: Optional[int] = None,
        year_to: Optional[int] = None,
        min_citations: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Search for papers using semantic similarity.

        Args:
            query: Search query text
            limit: Maximum number of results
            year_from: Filter by minimum year
            year_to: Filter by maximum year
            min_citations: Filter by minimum citation count

        Returns:
            Dict with total count, query, and papers list
        """
        # Encode query to vector
        query_vector = self.encode_query(query)

        # Build filters
        filter_conditions = []

        if year_from is not None:
            filter_conditions.append(
                FieldCondition(
                    key="year",
                    range=Range(gte=year_from)
                )
            )

        if year_to is not None:
            filter_conditions.append(
                FieldCondition(
                    key="year",
                    range=Range(lte=year_to)
                )
            )

        if min_citations is not None:
            filter_conditions.append(
                FieldCondition(
                    key="cited_by_count",
                    range=Range(gte=min_citations)
                )
            )

        search_filter = Filter(must=filter_conditions) if filter_conditions else None

        try:
            # Search in Qdrant
            results = self.client.search(
                collection_name=self.collection,
                query_vector=query_vector,
                query_filter=search_filter,
                limit=limit,
                with_payload=True
            )

            # Format results
            papers = []
            for hit in results:
                payload = hit.payload
                authors = payload.get("authors", [])

                # Format author display
                if len(authors) == 1:
                    author_display = authors[0]
                elif len(authors) == 2:
                    author_display = f"{authors[0]} & {authors[1]}"
                elif len(authors) > 2:
                    author_display = f"{authors[0]} et al."
                else:
                    author_display = "Unknown"

                papers.append({
                    "id": str(hit.id),
                    "title": payload.get("title", ""),
                    "authors": authors,
                    "author_display": author_display,
                    "year": payload.get("year"),
                    "journal": payload.get("journal_name", ""),
                    "abstract": payload.get("abstract", ""),
                    "citations": payload.get("cited_by_count", 0),
                    "doi": payload.get("doi", ""),
                    "impact_factor": payload.get("impact_factor"),
                    "cas_zone": payload.get("cas_zone"),
                    "is_top": payload.get("is_top", False),
                    "score": round(hit.score, 3)
                })

            return {
                "total": len(papers),
                "query": query,
                "papers": papers
            }

        except Exception as e:
            return {
                "total": 0,
                "query": query,
                "papers": [],
                "error": str(e)
            }

    async def get_related_papers(
        self,
        text: str,
        limit: int = 3
    ) -> List[Dict[str, Any]]:
        """
        Get papers related to given text content.
        Used for automatic literature recommendations in chat.

        Args:
            text: Text content to find related papers for
            limit: Maximum number of papers to return

        Returns:
            List of paper dicts
        """
        result = await self.search_papers(query=text, limit=limit)
        return result.get("papers", [])


# Singleton instance
qdrant_service = QdrantService()
