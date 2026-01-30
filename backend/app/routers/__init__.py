from .chat import router as chat_router
from .literature import router as literature_router
from .files import router as files_router
from .projects import router as projects_router
from .chats import router as chats_router

__all__ = [
    "chat_router",
    "literature_router",
    "files_router",
    "projects_router",
    "chats_router"
]
