import httpx
from typing import Dict, Any
from app.core.config import settings


class URLhausAdapter:
    def __init__(self):
        self.api_key = settings.URLHAUS_API_KEY
        self.base_url = "https://urlhaus-api.abuse.ch/v1"
        self.timeout = 4.0

    def is_configured(self) -> bool:
        return bool(self.api_key and self.api_key.strip())

    async def lookup_url(self, url: str) -> Dict[str, Any]:
        # URLhaus community API can query even without key or with auth header if configured
        try:
            headers = {"API-KEY": self.api_key} if self.api_key else {}
            data = {"url": url}
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.post(f"{self.base_url}/url/", data=data, headers=headers)
                if res.status_code == 200:
                    json_data = res.json()
                    query_status = json_data.get("query_status")
                    if query_status == "ok":
                        threat = json_data.get("threat", "Malware delivery")
                        return {
                            "status": "success",
                            "verdict": "MALICIOUS",
                            "detail": f"Active URLhaus payload ({threat})",
                            "threat": threat
                        }
                    elif query_status == "no_results":
                        return {
                            "status": "success",
                            "verdict": "CLEAN",
                            "detail": "No malicious reports in URLhaus database"
                        }
                return {"status": "not_configured" if not self.is_configured() else "no_results", "verdict": "NEUTRAL", "detail": "URLhaus community query clear"}
        except Exception:
            return {"status": "error", "verdict": "UNAVAILABLE", "detail": "URLhaus connection error"}


urlhaus_adapter = URLhausAdapter()
