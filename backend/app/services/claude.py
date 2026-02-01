"""
Claude API Service
Uses Zeabur AI Gateway (OpenAI-compatible format)
Enhanced for GeoMind 3.0 with project memory and skills support
"""
import httpx
from typing import List, Dict, Any, Optional
from ..config import settings


class ClaudeService:
    """Service for interacting with Claude API via Zeabur AI Gateway."""

    def __init__(self):
        self.base_url = settings.CLAUDE_BASE_URL
        self.api_key = settings.CLAUDE_API_KEY
        self.model = settings.CLAUDE_MODEL
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None,
        max_tokens: int = 4096,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        """
        Send a chat completion request to Claude.

        Args:
            messages: List of message dicts with 'role' and 'content'
            system_prompt: Optional system prompt to prepend
            max_tokens: Maximum tokens in response
            temperature: Response randomness (0-1)

        Returns:
            Dict containing the response content and metadata
        """
        # Build messages list with optional system prompt
        full_messages = []
        if system_prompt:
            full_messages.append({"role": "system", "content": system_prompt})
        full_messages.extend(messages)

        payload = {
            "model": self.model,
            "messages": full_messages,
            "max_tokens": max_tokens,
            "temperature": temperature
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=self.headers,
                    json=payload
                )
                response.raise_for_status()
                data = response.json()

                return {
                    "content": data["choices"][0]["message"]["content"],
                    "usage": data.get("usage", {}),
                    "model": data.get("model", self.model)
                }
            except httpx.HTTPStatusError as e:
                return {
                    "content": f"API Error: {e.response.status_code}",
                    "error": str(e),
                    "usage": {}
                }
            except Exception as e:
                return {
                    "content": f"Error: {str(e)}",
                    "error": str(e),
                    "usage": {}
                }

    def get_geomind_system_prompt(
        self,
        file_context: Optional[str] = None,
        project_memory: Optional[Dict[str, Any]] = None,
        skills: Optional[List[str]] = None
    ) -> str:
        """
        Get the GeoMind system prompt for earth science context.

        Args:
            file_context: Optional file data context to include
            project_memory: Optional project memory for context
            skills: Optional list of skill names to load

        Returns:
            System prompt string
        """
        base_prompt = """You are GeoMind 3.0, an AI research assistant specialized in Earth Sciences.

## Core Capabilities
- **文献检索**: 70万+ DOI 验证文献数据库
- **数据分析**: 统计、时序、空间分析
- **代码执行**: Python 代码实时运行
- **论文写作**: 从文献到定稿全流程协作

## Expertise Areas
- Hydrology and water resources
- Geochemistry and water quality analysis
- Climate science and meteorology
- Environmental monitoring and assessment
- Spatial data analysis and GIS
- Machine learning for earth science

## Guidelines
1. 提供科学准确、有理有据的回答
2. 分析数据时清晰解释方法论
3. 适当引用相关文献，格式：Author et al. (Year)
4. 使用正确的单位和科学记数法
5. 简洁但全面地解释
6. 不确定时承认局限性，建议进一步调查
7. **绝不编造文献** - 只引用数据库中验证过的文献

## Response Format
- 使用 Markdown 格式结构化响应
- 用清晰的要点列出数据摘要
- 突出关键发现和建议
- 代码用 ```python 代码块包裹
- 表格用三线表 Markdown 格式"""

        # Add project memory context if available
        if project_memory:
            memory_context = "\n\n## 项目记忆 (Project Memory)\n"

            if project_memory.get("literature_list"):
                lit_count = len(project_memory["literature_list"])
                memory_context += f"- 已选文献: {lit_count} 篇\n"

            if project_memory.get("gap_selected"):
                memory_context += f"- 选定 Gap: {project_memory['gap_selected']}\n"

            if project_memory.get("methodology"):
                memory_context += f"- 研究方案: 已确定\n"

            if project_memory.get("data_profile"):
                memory_context += f"- 数据概况: 已分析\n"

            if project_memory.get("results_data"):
                memory_context += f"- 分析结果: 已生成\n"

            sections = project_memory.get("sections", {})
            completed_sections = [k for k, v in sections.items() if v]
            if completed_sections:
                memory_context += f"- 已完成章节: {', '.join(completed_sections)}\n"

            base_prompt += memory_context

        # Add file context if available
        if file_context:
            base_prompt += f"\n\n## 用户数据\n{file_context}"

        # Add skill prompts if specified
        if skills:
            from .skills import get_skill_prompt
            skill_prompt = get_skill_prompt(skills)
            if skill_prompt:
                base_prompt += skill_prompt

        return base_prompt


# Singleton instance
claude_service = ClaudeService()
