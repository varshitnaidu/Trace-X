import hashlib
from datetime import datetime, timezone
from typing import Dict, Any


def calculate_sha256(data: bytes) -> str:
    """Computes exact SHA-256 hex digest of raw input bytes."""
    return hashlib.sha256(data).hexdigest()


def calculate_hashes(data: bytes) -> Dict[str, str]:
    """Computes SHA-256, SHA-1, and MD5 digests of raw input bytes."""
    return {
        "sha256": hashlib.sha256(data).hexdigest(),
        "sha1": hashlib.sha1(data).hexdigest(),
        "md5": hashlib.md5(data).hexdigest(),
    }


def format_file_size(size_in_bytes: int) -> str:
    """Formats integer bytes into human-readable size string."""
    if size_in_bytes < 1024:
        return f"{size_in_bytes} B"
    elif size_in_bytes < 1024 * 1024:
        return f"{size_in_bytes / 1024:.1f} KB"
    else:
        return f"{size_in_bytes / (1024 * 1024):.1f} MB"


def create_evidence_record(
    filename: str,
    raw_bytes: bytes,
    actor: str,
    case_id: str
) -> Dict[str, Any]:
    """Generates an immutable evidence record for ingested artifacts."""
    hashes = calculate_hashes(raw_bytes)
    size_bytes = len(raw_bytes)
    return {
        "case_id": case_id,
        "artifact_name": filename,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "size_bytes": size_bytes,
        "file_size": format_file_size(size_bytes),
        "sha256": hashes["sha256"],
        "sha1": hashes["sha1"],
        "md5": hashes["md5"],
        "actor": actor,
        "source": "DIRECT_UPLOAD",
        "processing_status": "SEALED",
    }
