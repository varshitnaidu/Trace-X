from typing import List
from fastapi import APIRouter, HTTPException, status
from app.models.case import CaseModel
from app.models.analysis import CaseChatRequest, CaseChatResponse
from app.services.case_store import case_store
from app.services.explainability import answer_analyst_question

router = APIRouter()


@router.get("/cases", response_model=List[CaseModel], summary="List Investigation Cases")
async def list_cases():
    """Returns all incident investigation cases stored in the platform."""
    return case_store.get_all_cases()


@router.get("/cases/{case_id}", response_model=CaseModel, summary="Get Investigation Case Details")
async def get_case(case_id: str):
    """Retrieves full investigation dossier for a specific case ID."""
    case = case_store.get_case_by_id(case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case with ID '{case_id}' not found."
        )
    return case


@router.post("/cases/{case_id}/chat", response_model=CaseChatResponse, summary="Ask TRACE-X AI Assistant")
async def chat_with_case(case_id: str, request: CaseChatRequest):
    """
    Provides technical forensic responses grounded strictly in the verified case indicators.
    Answers questions about risk score, BEC probability, relay hops, and next investigation actions.
    """
    case = case_store.get_case_by_id(case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case with ID '{case_id}' not found."
        )
    reply = answer_analyst_question(case, request.question)
    return CaseChatResponse(
        reply=reply,
        grounded_indicators=[f.factor for f in case.contributingFactors[:3]]
    )
