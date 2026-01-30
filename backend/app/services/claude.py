"""
Claude API Service
Uses Zeabur AI Gateway (OpenAI-compatible format)
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

    def get_geomind_system_prompt(self, file_context: Optional[str] = None) -> str:
        """
        Get the GeoMind system prompt for earth science context.

        Args:
            file_context: Optional file data context to include

        Returns:
            System prompt string
        """
        base_prompt = """You are GeoMind, an AI assistant specialized in Earth Sciences and environmental research.

Your expertise includes:
- Hydrology and water resources
- Geochemistry and water quality analysis
- Climate science and meteorology
- Environmental monitoring and assessment
- Spatial data analysis and GIS
- Statistical analysis of environmental data

Guidelines:
1. Provide scientifically accurate and well-reasoned responses
2. When analyzing data, explain your methodology clearly
3. Reference relevant literature when appropriate
4. Use appropriate units and scientific notation
5. Be concise but thorough in your explanations
6. When uncertain, acknowledge limitations and suggest further investigation

Response format:
- Use markdown for structured responses
- Include data summaries in clear bullet points
- Highlight key findings and recommendations
- Cite literature in format: Author et al. (Year)"""

        if file_context:
            base_prompt += f"\n\nUser has uploaded data:\n{file_context}"

        return base_prompt


# Singleton instance
claude_service = ClaudeService()
