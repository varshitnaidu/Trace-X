from typing import List, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import decode_access_token
from app.services.auth_service import auth_service
from app.models.auth import User

security_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)
) -> User:
    """
    Extracts, decodes, and validates JWT bearer token.
    Raises 401 Unauthorized if invalid or expired.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    email: Optional[str] = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload is missing subject.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = auth_service.get_user_by_email(email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User associated with token not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if user.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is disabled."
        )
    
    return user


async def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)
) -> Optional[User]:
    """
    Returns the user if token is valid, or None if no token provided.
    Useful for endpoints allowing guest/demo access.
    """
    if not credentials:
        return None
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None


def require_roles(allowed_roles: List[str]):
    """
    Enforces role-based access control (RBAC).
    Raises 403 Forbidden if user's role is not permitted.
    """
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires one of roles {allowed_roles}."
            )
        return current_user
    return role_checker
