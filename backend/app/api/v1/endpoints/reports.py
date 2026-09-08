from fastapi import APIRouter, HTTPException, status, Response
from app.services.case_store import case_store
from app.services.report_generator import (
    generate_pdf_report,
    generate_ioc_csv,
    generate_json_dossier
)
from app.services.audit_ledger import audit_ledger

router = APIRouter()


@router.get("/reports/{case_id}/pdf", summary="Download Forensic PDF Report")
async def download_pdf_report(case_id: str):
    """Generates and streams an official, court-ready forensic PDF investigation report."""
    case = case_store.get_case_by_id(case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case with ID '{case_id}' not found."
        )

    pdf_bytes = generate_pdf_report(case)

    # Log report generation to audit ledger
    audit_ledger.record_event(
        analyst=case.analyst,
        action="FORENSIC_REPORT_GENERATED",
        resource=f"REP-{case.id}.pdf",
        status="SUCCESS"
    )

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="REP-{case.id}.pdf"'
        }
    )


@router.get("/reports/{case_id}/csv", summary="Download IOC CSV Export")
async def download_ioc_csv(case_id: str):
    """Generates and streams extracted IOCs formatted as CSV for SIEM/EDR ingestion."""
    case = case_store.get_case_by_id(case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case with ID '{case_id}' not found."
        )

    csv_text = generate_ioc_csv(case)

    return Response(
        content=csv_text,
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="IOCs-{case.id}.csv"'
        }
    )


@router.get("/reports/{case_id}/json", summary="Download JSON Forensic Dossier")
async def download_json_dossier(case_id: str):
    """Streams full JSON structured forensic dossier."""
    case = case_store.get_case_by_id(case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case with ID '{case_id}' not found."
        )

    json_str = generate_json_dossier(case)

    return Response(
        content=json_str,
        media_type="application/json",
        headers={
            "Content-Disposition": f'attachment; filename="Dossier-{case.id}.json"'
        }
    )
