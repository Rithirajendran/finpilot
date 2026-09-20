from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User

from app.services.auth import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


security = HTTPBearer()


# ==========================================================
# REQUEST MODELS
# ==========================================================

class RegisterRequest(BaseModel):

    name: str
    email: str
    password: str


class LoginRequest(BaseModel):

    email: str
    password: str


# ==========================================================
# REGISTER
# ==========================================================

@router.post("/register")
def register_user(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):

    name = request.name.strip()

    email = request.email.strip().lower()

    password = request.password


    # ------------------------------------------------------
    # Validation
    # ------------------------------------------------------

    if not name:

        raise HTTPException(
            status_code=400,
            detail="Name is required."
        )


    if not email:

        raise HTTPException(
            status_code=400,
            detail="Email is required."
        )


    if len(password) < 6:

        raise HTTPException(
            status_code=400,
            detail="Password must contain at least 6 characters."
        )


    # ------------------------------------------------------
    # Check existing user
    # ------------------------------------------------------

    existing_user = (
        db.query(User)
        .filter(
            User.email == email
        )
        .first()
    )


    if existing_user:

        raise HTTPException(
            status_code=409,
            detail="An account with this email already exists."
        )


    # ------------------------------------------------------
    # Create user
    # ------------------------------------------------------

    user = User(
        name=name,
        email=email,
        password_hash=hash_password(password)
    )


    db.add(user)

    db.commit()

    db.refresh(user)


    return {
        "status": "success",
        "message": "Account created successfully.",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }


# ==========================================================
# LOGIN
# ==========================================================

@router.post("/login")
def login_user(
    request: LoginRequest,
    db: Session = Depends(get_db)
):

    email = request.email.strip().lower()

    password = request.password


    user = (
        db.query(User)
        .filter(
            User.email == email
        )
        .first()
    )


    if not user:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )


    if not verify_password(
        password,
        user.password_hash
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )


    token = create_access_token(
        user_id=user.id,
        email=user.email
    )


    return {
        "status": "success",
        "message": "Login successful.",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }


# ==========================================================
# CURRENT USER
# ==========================================================

@router.get("/me")
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        security
    ),
    db: Session = Depends(get_db)
):

    token = credentials.credentials


    payload = decode_access_token(token)


    if not payload:

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token."
        )


    user_id = payload.get("sub")


    if not user_id:

        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token."
        )


    user = (
        db.query(User)
        .filter(
            User.id == int(user_id)
        )
        .first()
    )


    if not user:

        raise HTTPException(
            status_code=401,
            detail="User account not found."
        )


    return {
        "status": "success",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }