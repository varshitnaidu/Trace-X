from typing import Optional
from pydantic import BaseModel
from app.models.case import CaseModel


class RawEmailAnalyzeRequest(BaseModel):
    raw_content: str
    filename: Optional[str] = "pasted_email.eml"
    live: Optional[bool] = None


class CaseChatRequest(BaseModel):
    question: str


class CaseChatResponse(BaseModel):
    reply: str
    grounded_indicators: list = []
