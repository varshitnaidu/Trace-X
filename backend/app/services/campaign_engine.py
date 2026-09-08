from typing import List, Optional, Dict
from app.models.campaign import CampaignModel
from app.models.case import CaseModel


class CampaignEngine:
    def __init__(self):
        self._campaigns: Dict[str, CampaignModel] = {}
        self._initialize_seed_campaigns()

    def _initialize_seed_campaigns(self):
        c1 = CampaignModel(
            id="CMP-FIN-2026-04",
            name="ShadowWire Executive Impersonation",
            threatActorGroup="UNC-2911 (Tracked Cluster)",
            firstSeen="2026-08-14",
            lastSeen="2026-09-07",
            severity="CRITICAL",
            confidenceScore=92,
            associatedEmailsCount=14,
            sharedDomains=["paypaI-billing-service.net", "wire-exec-auth.cc", "swift-settlement-corp.com"],
            sharedIPs=["185.220.101.42", "194.26.29.110", "91.240.118.50"],
            targetedSectors=["Financial Services", "Higher Education", "Defense Contractors"],
            summary="Active spear-phishing and executive wire fraud campaign leveraging homoglyph domain impersonation, Tor exit relay routing, and bulletproof Russian VPS hosts.",
            caseIds=["CAS-2026-0091"]
        )

        c2 = CampaignModel(
            id="CMP-M365-2026-11",
            name="OfficeHarvester Global Campaign",
            threatActorGroup="Storm-0824 (Likely)",
            firstSeen="2026-07-28",
            lastSeen="2026-09-06",
            severity="HIGH",
            confidenceScore=84,
            associatedEmailsCount=38,
            sharedDomains=["security-microsoft-update365.com", "login-office365-verify.info", "m365-session-auth.net"],
            sharedIPs=["45.154.255.88", "193.106.191.24", "185.162.228.17"],
            targetedSectors=["Technology", "Healthcare", "Government Administration"],
            summary="Widespread automated credential harvesting campaign sending fake 2FA and password expiry notices leading to adversary-in-the-middle (AiTM) landing portals.",
            caseIds=["CAS-2026-0087"]
        )

        self._campaigns[c1.id] = c1
        self._campaigns[c2.id] = c2

    def get_all_campaigns(self) -> List[CampaignModel]:
        return list(self._campaigns.values())

    def get_campaign_by_id(self, campaign_id: str) -> Optional[CampaignModel]:
        return self._campaigns.get(campaign_id)

    def correlate_case(self, case: CaseModel) -> Optional[CampaignModel]:
        """
        Correlates an incoming case with existing tracked adversary clusters based on IOC overlap.
        """
        case_domains = {d.domain.lower() for d in case.domains}
        case_ips = {ip.ip for ip in case.ips}

        for campaign in self._campaigns.values():
            shared_d = case_domains.intersection({d.lower() for d in campaign.sharedDomains})
            shared_i = case_ips.intersection(set(campaign.sharedIPs))

            if shared_d or shared_i:
                # Correlated!
                if case.id not in campaign.caseIds:
                    campaign.caseIds.append(case.id)
                    campaign.associatedEmailsCount += 1
                case.campaignId = campaign.id
                case.campaignName = campaign.name
                return campaign

        return None


campaign_engine = CampaignEngine()
