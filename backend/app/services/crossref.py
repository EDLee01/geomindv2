"""
CrossRef Service
Verify DOIs and retrieve paper metadata
"""
import httpx
import asyncio
from typing import Optional, Dict, Any, List, Tuple
import random


CROSSREF_BASE_URL = "https://api.crossref.org/works"
USER_AGENT = "GeoMind/3.0 (mailto:support@geomind.app)"


async def verify_doi(doi: str, timeout: int = 10) -> Tuple[bool, Optional[Dict[str, Any]]]:
    """
    Verify a single DOI using CrossRef API.

    Args:
        doi: DOI to verify (can be full URL or just the DOI)
        timeout: Request timeout in seconds

    Returns:
        Tuple of (is_valid, metadata_dict)
    """
    # Extract DOI from URL if needed
    if "doi.org/" in doi:
        doi = doi.split("doi.org/")[-1]

    url = f"{CROSSREF_BASE_URL}/{doi}"

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                url,
                timeout=timeout,
                headers={"User-Agent": USER_AGENT}
            )

            if response.status_code == 200:
                data = response.json()
                message = data.get("message", {})
                return True, {
                    "doi": doi,
                    "title": message.get("title", [""])[0] if message.get("title") else "",
                    "authors": [
                        f"{a.get('given', '')} {a.get('family', '')}".strip()
                        for a in message.get("author", [])
                    ],
                    "year": message.get("published-print", {}).get("date-parts", [[None]])[0][0]
                           or message.get("published-online", {}).get("date-parts", [[None]])[0][0],
                    "journal": message.get("container-title", [""])[0] if message.get("container-title") else "",
                    "cited_by_count": message.get("is-referenced-by-count", 0)
                }
            elif response.status_code == 404:
                return False, {"doi": doi, "error": "DOI not found"}
            else:
                return False, {"doi": doi, "error": f"HTTP {response.status_code}"}

    except httpx.TimeoutException:
        return False, {"doi": doi, "error": "Request timeout"}
    except Exception as e:
        return False, {"doi": doi, "error": str(e)}


async def verify_dois_batch(dois: List[str], sample_first: bool = True) -> Dict[str, Any]:
    """
    Verify multiple DOIs with optional sampling strategy.

    Strategy:
    1. If sample_first=True, randomly sample 3 DOIs first
    2. If all 3 pass, return success with recommendation to verify
    3. If any fail, verify all DOIs and remove invalid ones

    Args:
        dois: List of DOIs to verify
        sample_first: Whether to use sampling strategy

    Returns:
        Dict with verification results
    """
    if not dois:
        return {"valid": [], "invalid": [], "all_verified": True}

    # Remove duplicates while preserving order
    unique_dois = list(dict.fromkeys(dois))

    if sample_first and len(unique_dois) > 3:
        # Sample 3 random DOIs for quick check
        sample_indices = random.sample(range(len(unique_dois)), 3)
        sample_dois = [unique_dois[i] for i in sample_indices]

        # Verify sample
        sample_results = await asyncio.gather(
            *[verify_doi(doi) for doi in sample_dois]
        )

        # Check if all samples passed
        all_passed = all(is_valid for is_valid, _ in sample_results)

        if all_passed:
            # All samples valid, return with recommendation
            return {
                "valid": unique_dois,
                "invalid": [],
                "all_verified": False,
                "sample_verified": True,
                "message": "3/3 sample DOIs verified. Full verification recommended."
            }

    # Full verification needed
    results = await asyncio.gather(
        *[verify_doi(doi) for doi in unique_dois]
    )

    valid = []
    invalid = []

    for doi, (is_valid, metadata) in zip(unique_dois, results):
        if is_valid:
            valid.append({"doi": doi, "metadata": metadata})
        else:
            invalid.append({"doi": doi, "error": metadata.get("error") if metadata else "Unknown error"})

    return {
        "valid": [v["doi"] for v in valid],
        "invalid": [i["doi"] for i in invalid],
        "valid_metadata": valid,
        "invalid_details": invalid,
        "all_verified": True,
        "removed_count": len(invalid)
    }


async def get_paper_metadata(doi: str) -> Optional[Dict[str, Any]]:
    """
    Get full paper metadata from CrossRef.

    Args:
        doi: DOI to look up

    Returns:
        Paper metadata dict or None
    """
    is_valid, metadata = await verify_doi(doi)
    return metadata if is_valid else None
