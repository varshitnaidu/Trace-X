import httpx
from typing import Dict, Any
from app.core.config import settings


class AbuseIPDBAdapter:
    def __init__(self):
        self.api_key = settings.ABUSEIPDB_API_KEY
        self.base_url = "https://api.abuseipdb.com/api/v2"
        self.timeout = 4.0

    def is_configured(self) -> bool:
        return bool(self.api_key and self.api_key.strip())

    async def check_ip(self, ip: str) -> Dict[str, Any]:
        if not self.is_configured():
            return {
                "status": "not_configured",
                "verdict": "UNAVAILABLE",
                "abuse_score": 0,
                "total_reports": 0,
                "detail": "AbuseIPDB API key not configured"
            }
        try:
            headers = {
                "Key": self.api_key,
                "Accept": "application/json"
            }
            params = {"ipAddress": ip, "maxAgeInDays": "90"}
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.get(f"{self.base_url}/check", headers=headers, params=params)
                if res.status_code == 429:
                    return {"status": "rate_limited", "verdict": "UNAVAILABLE", "abuse_score": 0, "total_reports": 0, "detail": "Rate limited"}
                if res.status_code == 200:
                    data = res.json().get("data", {})
                    score = data.get("abuseConfidenceScore", 0)
                    reports = data.get("totalReports", 0)
                    verdict = "MALICIOUS" if score >= 50 else ("SUSPICIOUS" if score > 0 else "CLEAN")
                    return {
                        "status": "success",
                        "verdict": verdict,
                        "abuse_score": score,
                        "total_reports": reports,
                        "country": data.get("countryCode", "Unknown"),
                        "isp": data.get("isp", "Unknown"),
                        "usage_type": data.get("usageType", "Data Center / Web Hosting"),
                        "detail": f"Reported {reports:,} times ({score}% confidence)"
                    }
                return {"status": "error", "verdict": "UNKNOWN", "abuse_score": 0, "total_reports": 0, "detail": f"Status {res.status_code}"}
        except Exception:
            return {"status": "error", "verdict": "UNAVAILABLE", "abuse_score": 0, "total_reports": 0, "detail": "AbuseIPDB connection error"}


abuseipdb_adapter = AbuseIPDBAdapter()
