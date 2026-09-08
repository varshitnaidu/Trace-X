import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
import jwt

from app.core.config import settings


def hash_password(password: str) -> str:
    """
    Hashes a password using PBKDF2-HMAC-SHA256 with a unique random salt and 100,000 iterations.
    Format: $pbkdf2-sha256$100000$<salt>$<hash>
    """
    salt = secrets.token_hex(16)
    iterations = 100000
    derived = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        iterations
    ).hex()
    return f"$pbkdf2-sha256${iterations}${salt}${derived}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain password against a stored PBKDF2-HMAC-SHA256 hash.
    """
    try:
        parts = hashed_password.split("$")
        if len(parts) != 5 or parts[1] != "pbkdf2-sha256":
            return False
        iterations = int(parts[2])
        salt = parts[3]
        expected_derived = parts[4]
        
        actual_derived = hashlib.pbkdf2_hmac(
            "sha256",
            plain_password.encode("utf-8"),
            salt.encode("utf-8"),
            iterations
        ).hex()
        return hmac.compare_digest(actual_derived, expected_derived)
    except Exception:
        return False


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Creates a signed JWT access token.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decodes and validates a signed JWT access token.
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except jwt.PyJWTError:
        return None
