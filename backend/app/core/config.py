from typing import List, Dict, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    PROJECT_NAME: str = "TRACE-X"
    TAGLINE: str = "AI-Powered Email Threat Intelligence & Digital Forensics"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = "tracex-insecure-dev-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 8  # 8 hours

    BACKEND_HOST: str = "127.0.0.1"
    BACKEND_PORT: int = 8000
    
    # CORS Origins
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    DEMO_MODE: bool = True
    MAX_UPLOAD_SIZE_BYTES: int = 25 * 1024 * 1024  # 25 MB

    # Threat Intelligence API Keys (Optional in Demo Mode)
    VIRUSTOTAL_API_KEY: Optional[str] = None
    ABUSEIPDB_API_KEY: Optional[str] = None
    PHISHTANK_API_KEY: Optional[str] = None
    URLHAUS_API_KEY: Optional[str] = None
    LLM_API_KEY: Optional[str] = None
    LLM_MODEL: str = "gemini-1.5-flash"

    # Default Deterministic Risk Weights
    RISK_WEIGHTS: Dict[str, int] = {
        "spf_failure": 15,
        "dkim_failure": 15,
        "dmarc_failure": 15,
        "reply_to_mismatch": 10,
        "return_path_mismatch": 10,
        "lookalike_domain": 15,
        "raw_ip_url": 15,
        "tor_anonymizer_relay": 15,
        "suspicious_attachment": 15,
        "bec_keywords": 10,
    }

    # Demo Seed Credentials
    DEMO_ANALYST_EMAIL: str = "sarah.jenkins@trace-x.soc"
    DEMO_ANALYST_PASSWORD: str = "analyst123"
    DEMO_ADMIN_EMAIL: str = "admin@trace-x.soc"
    DEMO_ADMIN_PASSWORD: str = "admin123"

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="allow"
    )


settings = Settings()

