from typing import List, Optional
from pydantic import BaseModel, Field


class CampaignModel(BaseModel):
    id: str
    name: str
    threatActorGroup: str
    firstSeen: str
    lastSeen: str
    severity: str
    confidenceScore: int
    associatedEmailsCount: int
    sharedDomains: List[str] = Field(default_factory=list)
    sharedIPs: List[str] = Field(default_factory=list)
    targetedSectors: List[str] = Field(default_factory=list)
    summary: str
    caseIds: List[str] = Field(default_factory=list)
