"""
GeoMind 3.0 Backend API
Earth Science Intelligent Research Assistant
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .config import settings
from .routers import (
    chat_router,
    literature_router,
    files_router,
    projects_router,
    chats_router,
    auth_router
)
from .database import engine, Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("GeoMind 3.0 API starting up...")

    # Create database tables
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables created/verified")
    except Exception as e:
        print(f"Database initialization warning: {e}")
        print("Continuing without database - some features may be limited")

    yield

    # Shutdown
    print("GeoMind API shutting down...")


app = FastAPI(
    title="GeoMind API",
    description="""
## GeoMind 3.0 - Earth Science Intelligent Research Assistant

**Core Features:**
- 📚 Literature Search: 700,000+ verified papers with DOI validation
- 🧪 Data Analysis: Statistical, time series, and spatial analysis
- 💻 Code Execution: Python code with visualization support
- 📝 Paper Writing: Full workflow from literature to draft

**API Sections:**
- `/api/projects`: Project management with persistent memory
- `/api/chats`: Conversation management with message history
- `/api/chat`: Quick chat completions (legacy)
- `/api/literature`: Paper search and verification
- `/api/files`: File upload and processing
    """,
    version="3.0.0",
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

# Include routers - New GeoMind 3.0 APIs
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(projects_router, prefix="/api/projects", tags=["Projects"])
app.include_router(chats_router, prefix="/api/chats", tags=["Chats"])

# Legacy/utility routers
app.include_router(chat_router, prefix="/api/chat", tags=["Chat (Legacy)"])
app.include_router(literature_router, prefix="/api/literature", tags=["Literature"])
app.include_router(files_router, prefix="/api/files", tags=["Files"])


@app.get("/health")
async def health_check():
    """Health check endpoint for deployment verification."""
    return {
        "status": "ok",
        "version": "3.0.0"
    }


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "GeoMind API",
        "version": "3.0.0",
        "description": "Earth Science Intelligent Research Assistant",
        "features": [
            "Literature Search (700k+ papers)",
            "Project Management with Memory",
            "Code Execution",
            "Paper Writing Workflow"
        ],
        "docs": "/docs"
    }
