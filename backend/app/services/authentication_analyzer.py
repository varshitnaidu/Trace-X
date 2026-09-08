import re
from typing import Dict, Any, Tuple
from app.models.case import SpfResult, DkimResult, DmarcResult


def parse_authentication_headers(
    auth_results: str,
    received_spf: str,
    dkim_signatures: list,
    sender_domain: str
) -> Tuple[SpfResult, DkimResult, DmarcResult]:
    """
    Parses Authentication-Results and Received-SPF headers reported by receiving mail transfer agents (MTAs).
    Correlates reported authentication results with the sender domain.
    """
    raw_auth = auth_results.lower() if auth_results else ""
    raw_spf = received_spf.lower() if received_spf else ""

    # 1. SPF Analysis
    spf_status = "NONE"
    spf_detail = "No SPF verification records found in incoming headers."

    if "spf=pass" in raw_auth or "pass" in raw_spf:
        spf_status = "PASS"
        spf_detail = f"Sender IP is authorized under domain {sender_domain} SPF records (reported by receiving MTA)."
    elif "spf=fail" in raw_auth or "fail" in raw_spf:
        spf_status = "FAIL"
        ip_match = re.search(r'sender ip is ([0-9.]+)', auth_results, re.IGNORECASE)
        ip_str = ip_match.group(1) if ip_match else "originating IP"
        spf_detail = f"IP {ip_str} is not authorized under domain {sender_domain} SPF records (reported by MTA)."
    elif "spf=softfail" in raw_auth or "softfail" in raw_spf:
        spf_status = "SOFTFAIL"
        spf_detail = f"Domain {sender_domain} published an SPF record that softfails originating IP."
    elif "spf=neutral" in raw_auth or "neutral" in raw_spf:
        spf_status = "NONE"
        spf_detail = f"SPF evaluation returned neutral for domain {sender_domain}."

    # 2. DKIM Analysis
    dkim_status = "NONE"
    dkim_detail = "No DKIM signature found in message header."

    if dkim_signatures:
        if "dkim=pass" in raw_auth:
            dkim_status = "PASS"
            dkim_detail = f"Cryptographic signature verified for domain {sender_domain}."
        elif "dkim=fail" in raw_auth:
            dkim_status = "FAIL"
            dkim_detail = "Signature failed body hash or public key verification (rsa-sha256 mismatch)."
        else:
            dkim_status = "NONE"
            dkim_detail = f"Found {len(dkim_signatures)} unverified DKIM-Signature header(s)."
    else:
        if "dkim=fail" in raw_auth:
            dkim_status = "FAIL"
            dkim_detail = "Receiving server reported DKIM signature failure."
        elif "dkim=pass" in raw_auth:
            dkim_status = "PASS"
            dkim_detail = "Receiving server reported DKIM signature passed."

    # 3. DMARC Analysis
    dmarc_status = "NONE"
    dmarc_policy = "none"
    dmarc_detail = f"No DMARC policy evaluated for {sender_domain}."

    # Extract policy if present
    policy_match = re.search(r'\(p=([a-zA-Z]+)', auth_results)
    if policy_match:
        dmarc_policy = policy_match.group(1).lower()

    if "dmarc=pass" in raw_auth:
        dmarc_status = "PASS"
        dmarc_detail = f"Full DMARC alignment verified for {sender_domain} with p={dmarc_policy} policy."
    elif "dmarc=fail" in raw_auth:
        dmarc_status = "FAIL"
        dmarc_detail = f"Domain alignment failed. From header domain does not align with SPF/DKIM envelope (policy={dmarc_policy})."
    else:
        # If SPF or DKIM failed, and no DMARC header, estimate alignment failure
        if spf_status in ["FAIL", "SOFTFAIL"] and dkim_status in ["FAIL", "NONE"]:
            dmarc_status = "FAIL"
            dmarc_detail = "DMARC alignment compromised due to concurrent SPF softfail/fail and absent valid DKIM."

    return (
        SpfResult(status=spf_status, detail=spf_detail),
        DkimResult(status=dkim_status, detail=dkim_detail),
        DmarcResult(status=dmarc_status, detail=dmarc_detail, policy=dmarc_policy)
    )
