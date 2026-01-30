"""
GeoMind 2.0 Backend API
Earth Science Online Computing Platform
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .config import settings
from .routers import chat_router, literature_router, files_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("GeoMind API starting up...")
    yield
    # Shutdown
    print("GeoMind API shutting down...")


app = FastAPI(
    title="GeoMind API",
    description="Earth Science Online Computing Platform - AI-powered research assistant",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"https://.*\.zeabur\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat_router, prefix="/api/chat", tags=["Chat"])
app.include_router(literature_router, prefix="/api/literature", tags=["Literature"])
app.include_router(files_router, prefix="/api/files", tags=["Files"])


@app.get("/health")
async def health_check():
    """Health check endpoint for deployment verification."""
    return {"status": "ok"}


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "GeoMind API",
        "version": "2.0.0",
        "description": "Earth Science Online Computing Platform",
        "docs": "/docs"
    }
