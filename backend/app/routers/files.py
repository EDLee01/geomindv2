"""
Files API Router
Handles file upload and processing
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import pandas as pd
import io
import uuid

from ..config import settings

router = APIRouter()


class FilePreview(BaseModel):
    """Preview of uploaded file."""
    rows: int
    columns: int
    column_names: List[str]
    head: List[Dict[str, Any]]
    dtypes: Dict[str, str]


class UploadResponse(BaseModel):
    """File upload response."""
    id: str
    filename: str
    size: int
    preview: FilePreview


# In-memory storage for uploaded files (replace with proper storage in production)
file_storage: Dict[str, Dict[str, Any]] = {}


def validate_file_extension(filename: str) -> bool:
    """Check if file extension is allowed."""
    return any(filename.lower().endswith(ext) for ext in settings.ALLOWED_EXTENSIONS)


def read_file_to_dataframe(content: bytes, filename: str) -> pd.DataFrame:
    """Read file content into pandas DataFrame."""
    if filename.lower().endswith('.csv'):
        return pd.read_csv(io.BytesIO(content))
    elif filename.lower().endswith(('.xlsx', '.xls')):
        return pd.read_excel(io.BytesIO(content))
    else:
        raise ValueError(f"Unsupported file format: {filename}")


def generate_file_summary(df: pd.DataFrame, filename: str) -> str:
    """Generate a text summary of the DataFrame for AI context."""
    summary = f"File: {filename}\n"
    summary += f"Shape: {df.shape[0]} rows x {df.shape[1]} columns\n"
    summary += f"Columns: {', '.join(df.columns.tolist())}\n"
    summary += f"\nColumn types:\n"
    for col in df.columns:
        dtype = str(df[col].dtype)
        non_null = df[col].count()
        summary += f"  - {col}: {dtype} ({non_null} non-null values)\n"

    # Add statistical summary for numeric columns
    numeric_cols = df.select_dtypes(include=['number']).columns
    if len(numeric_cols) > 0:
        summary += "\nNumeric column statistics:\n"
        stats = df[numeric_cols].describe()
        for col in numeric_cols[:5]:  # Limit to first 5 numeric columns
            summary += f"  - {col}: min={stats[col]['min']:.2f}, max={stats[col]['max']:.2f}, mean={stats[col]['mean']:.2f}\n"

    return summary


@router.post("/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """
    Upload a data file (Excel or CSV) for analysis.

    - **file**: File to upload (xlsx, xls, or csv)

    Returns file ID, filename, size, and data preview.
    """
    # Validate file extension
    if not validate_file_extension(file.filename):
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Supported types: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )

    # Read file content
    content = await file.read()

    # Check file size
    if len(content) > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {settings.MAX_FILE_SIZE / (1024*1024):.1f}MB"
        )

    try:
        # Parse file into DataFrame
        df = read_file_to_dataframe(content, file.filename)

        # Generate file ID
        file_id = str(uuid.uuid4())[:8]

        # Create preview (first 10 rows)
        head_data = df.head(10).fillna("").to_dict(orient='records')

        # Get column data types
        dtypes = {col: str(dtype) for col, dtype in df.dtypes.items()}

        # Generate summary for AI context
        summary = generate_file_summary(df, file.filename)

        # Store file data
        file_storage[file_id] = {
            "filename": file.filename,
            "content": content,
            "dataframe": df,
            "summary": summary
        }

        return UploadResponse(
            id=file_id,
            filename=file.filename,
            size=len(content),
            preview=FilePreview(
                rows=len(df),
                columns=len(df.columns),
                column_names=df.columns.tolist(),
                head=head_data,
                dtypes=dtypes
            )
        )

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to parse file: {str(e)}"
        )


@router.get("/file/{file_id}")
async def get_file_info(file_id: str):
    """
    Get information about an uploaded file.

    - **file_id**: File ID from upload response
    """
    if file_id not in file_storage:
        raise HTTPException(status_code=404, detail="File not found")

    file_data = file_storage[file_id]
    df = file_data["dataframe"]

    return {
        "id": file_id,
        "filename": file_data["filename"],
        "rows": len(df),
        "columns": len(df.columns),
        "column_names": df.columns.tolist(),
        "summary": file_data["summary"]
    }


@router.get("/file/{file_id}/summary")
async def get_file_summary(file_id: str):
    """
    Get the AI-readable summary of an uploaded file.

    - **file_id**: File ID from upload response
    """
    if file_id not in file_storage:
        raise HTTPException(status_code=404, detail="File not found")

    return {
        "id": file_id,
        "summary": file_storage[file_id]["summary"]
    }


@router.delete("/file/{file_id}")
async def delete_file(file_id: str):
    """
    Delete an uploaded file.

    - **file_id**: File ID from upload response
    """
    if file_id not in file_storage:
        raise HTTPException(status_code=404, detail="File not found")

    del file_storage[file_id]
    return {"message": "File deleted successfully"}
