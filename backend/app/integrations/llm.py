import httpx
from typing import Dict, Any, List, Optional
from app.core.config import settings


class LlmAdapter:
    def __init__(self):
        self.api_key = settings.LLM_API_KEY
        self.model = settings.LLM_MODEL
        self.timeout = 5.0

    def is_configured(self) -> bool:
        return bool(self.api_key and self.api_key.strip())

    async def generate_explanation(
        self,
        subject: str,
        sender: str,
        classification: str,
        severity: str,
        risk_score: int,
        factors: List[str]
    ) -> Optional[Dict[str, Any]]:
        """
        Generates contextual AI summary if LLM_API_KEY is configured.
        Returns None if not configured or on network failure, falling back to deterministic templates.
        """
        if not self.is_configured():
            return None

        prompt = (
            f"Analyze this suspicious email as a SOC forensics expert.\n"
            f"Subject: {subject}\n"
            f"Sender: {sender}\n"
            f"Deterministic Classification: {classification} ({severity} - Score {risk_score}/100)\n"
            f"Observed Factors: {', '.join(factors)}\n"
            f"Provide a 2-sentence executive summary and 3 bullet key findings in JSON format."
        )

        try:
            # Supports Gemini API endpoint
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.2, "maxOutputTokens": 300}
            }
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        return {"text": text}
        except Exception:
            pass
        return None


llm_adapter = LlmAdapter()
