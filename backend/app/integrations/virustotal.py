import httpx
from typing import Dict, Any, Optional
from app.core.config import settings


class VirusTotalAdapter:
    def __init__(self):
        self.api_key = settings.VIRUSTOTAL_API_KEY
        self.base_url = "https://www.virustotal.com/api/v3"
        self.timeout = 4.0

    def is_configured(self) -> bool:
        return bool(self.api_key and self.api_key.strip())

    async def lookup_ip(self, ip: str) -> Dict[str, Any]:
        if not self.is_configured():
            return {"status": "not_configured", "verdict": "UNAVAILABLE", "detail": "VirusTotal API key not configured"}
        try:
            headers = {"x-apikey": self.api_key}
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.get(f"{self.base_url}/ip_addresses/{ip}", headers=headers)
                if res.status_code == 429:
                    return {"status": "rate_limited", "verdict": "UNAVAILABLE", "detail": "Rate limit exceeded on VirusTotal"}
                if res.status_code == 200:
                    data = res.json().get("data", {}).get("attributes", {})
                    stats = data.get("last_analysis_stats", {})
                    malicious = stats.get("malicious", 0)
                    total = sum(stats.values())
                    verdict = "MALICIOUS" if malicious >= 3 else ("SUSPICIOUS" if malicious > 0 else "CLEAN")
                    return {
                        "status": "success",
                        "verdict": verdict,
                        "malicious_count": malicious,
                        "total_count": total,
                        "detail": f"{malicious}/{total} security vendors flagged host"
                    }
                return {"status": "error", "verdict": "UNKNOWN", "detail": f"VT API returned status {res.status_code}"}
        except Exception as e:
            return {"status": "error", "verdict": "UNAVAILABLE", "detail": "VirusTotal connection error"}

    async def lookup_domain(self, domain: str) -> Dict[str, Any]:
        if not self.is_configured():
            return {"status": "not_configured", "verdict": "UNAVAILABLE", "detail": "VirusTotal API key not configured"}
        try:
            headers = {"x-apikey": self.api_key}
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.get(f"{self.base_url}/domains/{domain}", headers=headers)
                if res.status_code == 429:
                    return {"status": "rate_limited", "verdict": "UNAVAILABLE", "detail": "Rate limit exceeded on VirusTotal"}
                if res.status_code == 200:
                    data = res.json().get("data", {}).get("attributes", {})
                    stats = data.get("last_analysis_stats", {})
                    malicious = stats.get("malicious", 0)
                    total = sum(stats.values())
                    verdict = "MALICIOUS" if malicious >= 3 else ("SUSPICIOUS" if malicious > 0 else "CLEAN")
                    return {
                        "status": "success",
                        "verdict": verdict,
                        "malicious_count": malicious,
                        "total_count": total,
                        "detail": f"{malicious}/{total} vendors flagged domain"
                    }
                return {"status": "error", "verdict": "UNKNOWN", "detail": f"VT API returned status {res.status_code}"}
        except Exception:
            return {"status": "error", "verdict": "UNAVAILABLE", "detail": "VirusTotal connection error"}


virustotal_adapter = VirusTotalAdapter()
