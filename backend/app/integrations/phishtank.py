import httpx
from typing import Dict, Any
from app.core.config import settings


class PhishTankAdapter:
    def __init__(self):
        self.api_key = settings.PHISHTANK_API_KEY
        self.base_url = "https://checkurl.phishtank.com/checkurl/"
        self.timeout = 4.0

    def is_configured(self) -> bool:
        return bool(self.api_key and self.api_key.strip())

    async def check_url(self, url: str) -> Dict[str, Any]:
        if not self.is_configured():
            # In demo mode, identify known demo phishing targets
            if "paypaI" in url or "update365" in url:
                return {
                    "status": "success",
                    "verdict": "MALICIOUS",
                    "detail": "Associated with active credential phishing campaigns (Demonstration cache)"
                }
            return {
                "status": "not_configured",
                "verdict": "UNAVAILABLE",
                "detail": "PhishTank API key not configured"
            }
        try:
            headers = {"User-Agent": "phishtank/tracex-forensics"}
            data = {
                "url": url,
                "format": "json",
                "app_key": self.api_key
            }
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.post(self.base_url, data=data, headers=headers)
                if res.status_code == 200:
                    results = res.json().get("results", {})
                    in_database = results.get("in_database", False)
                    valid = results.get("valid", False)
                    if in_database and valid:
                        return {
                            "status": "success",
                            "verdict": "MALICIOUS",
                            "detail": "Verified phishing target in PhishTank registry"
                        }
                    return {
                        "status": "success",
                        "verdict": "CLEAN",
                        "detail": "Not flagged in PhishTank community feed"
                    }
                return {"status": "error", "verdict": "UNKNOWN", "detail": f"PhishTank returned status {res.status_code}"}
        except Exception:
            return {"status": "error", "verdict": "UNAVAILABLE", "detail": "PhishTank connection error"}


phishtank_adapter = PhishTankAdapter()
