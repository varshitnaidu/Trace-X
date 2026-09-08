from typing import List
from fastapi import APIRouter, HTTPException, status
from app.models.campaign import CampaignModel
from app.services.campaign_engine import campaign_engine

router = APIRouter()


@router.get("/campaigns", response_model=List[CampaignModel], summary="List Correlated Adversary Campaigns")
async def list_campaigns():
    """Returns all tracked adversary campaign clusters and associated case counts."""
    return campaign_engine.get_all_campaigns()


@router.get("/campaigns/{campaign_id}", response_model=CampaignModel, summary="Get Campaign Details")
async def get_campaign(campaign_id: str):
    """Retrieves detailed infrastructure and case correlation for a campaign cluster."""
    c = campaign_engine.get_campaign_by_id(campaign_id)
    if not c:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Campaign with ID '{campaign_id}' not found."
        )
    return c
