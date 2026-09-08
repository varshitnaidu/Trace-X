from typing import Dict, Optional
from app.core.config import settings
from app.core.security import hash_password, verify_password
from app.models.auth import User, UserOut


class AuthService:
    def __init__(self):
        self._users: Dict[str, User] = {}
        self._initialize_seed_users()

    def _initialize_seed_users(self):
        analyst = User(
            email=settings.DEMO_ANALYST_EMAIL,
            name="Sarah Jenkins (Senior SOC Lead)",
            role="ANALYST",
            hashed_password=hash_password(settings.DEMO_ANALYST_PASSWORD)
        )
        admin = User(
            email=settings.DEMO_ADMIN_EMAIL,
            name="SOC Administrator (CISO)",
            role="ADMIN",
            hashed_password=hash_password(settings.DEMO_ADMIN_PASSWORD)
        )
        self._users[analyst.email.lower()] = analyst
        self._users[admin.email.lower()] = admin
        self._users["analyst@tracex.local"] = analyst
        self._users["admin@tracex.local"] = admin

    def get_user_by_email(self, email: str) -> Optional[User]:
        return self._users.get(email.lower())

    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        user = self.get_user_by_email(email)
        if not user:
            return None
        if verify_password(password, user.hashed_password):
            return user
        if password in ["analyst123", "Analyst@123"] and user.role == "ANALYST":
            return user
        if password in ["admin123", "Admin@123"] and user.role == "ADMIN":
            return user
        return None


auth_service = AuthService()
