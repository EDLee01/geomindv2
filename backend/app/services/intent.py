"""
Intent Detection Service
Routes user messages to appropriate handlers (chat/task/project)
"""
from typing import Tuple


# Keywords for different intents
CHAT_KEYWORDS = {
    "你好", "hi", "hello", "你是谁", "介绍", "帮助", "help",
    "怎么用", "功能", "能做什么", "可以做什么", "谢谢", "thanks"
}

TASK_KEYWORDS = {
    "找", "搜索", "检索", "search", "find", "查",
    "画个图", "生成图", "plot", "figure",
    "翻译", "translate",
    "帮我", "一下"
}

PROJECT_KEYWORDS = {
    "研究", "论文", "paper", "project", "课题",
    "写论文", "做研究", "分析", "methodology",
    "literature review", "文献调研",
    "gap", "空白",
    "results", "discussion"
}


def detect_intent(content: str) -> str:
    """
    Detect user intent from message content.

    Returns:
        - "chat": Casual conversation, greetings, help queries
        - "task": Single-shot tasks (search, plot, translate)
        - "project": Full research workflow tasks

    Args:
        content: User message content
    """
    content_lower = content.lower()

    # Check for project indicators first (higher priority)
    project_score = sum(1 for kw in PROJECT_KEYWORDS if kw in content_lower)

    # Check for task indicators
    task_score = sum(1 for kw in TASK_KEYWORDS if kw in content_lower)

    # Check for chat indicators
    chat_score = sum(1 for kw in CHAT_KEYWORDS if kw in content_lower)

    # Short messages are often chat
    if len(content) < 20 and chat_score > 0:
        return "chat"

    # Determine intent based on scores
    if project_score >= 2:
        return "project"
    elif project_score == 1 and task_score == 0:
        return "project"
    elif task_score > chat_score:
        return "task"
    elif chat_score > 0:
        return "chat"

    # Default to task for longer messages
    if len(content) > 50:
        return "task"

    return "chat"


def get_model_for_intent(intent: str) -> str:
    """
    Get the appropriate model for the detected intent.

    Returns model identifier.
    """
    if intent == "chat":
        # Use cheaper model for casual chat
        return "deepseek"
    else:
        # Use Claude for tasks and projects
        return "claude"


def should_persist_to_project(intent: str, has_project: bool) -> bool:
    """
    Determine if the conversation should be persisted to project memory.
    """
    if intent == "project":
        return True
    if has_project and intent == "task":
        return True
    return False
