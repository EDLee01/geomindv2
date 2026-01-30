from .chat import router as chat_router
from .literature import router as literature_router
from .files import router as files_router

__all__ = ["chat_router", "literature_router", "files_router"]
