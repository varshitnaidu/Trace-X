from typing import Optional
from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class TokenPayload(BaseModel):
    sub: str
    role: str
    name: str


class LoginRequest(BaseModel):
    username: str  # Email or username
    password: str


class User(BaseModel):
    email: str
    name: str
    role: str  # 'ADMIN' | 'ANALYST'
    hashed_password: str
    disabled: bool = False


class UserOut(BaseModel):
    email: str
    name: str
    role: str


Token.model_rebuild()
