from typing import Annotated

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm

from app.schemas import Token, User, UserPublic, UserCreate
from app.database import SessionDep
from app.services import auth_service
from app.dependencies import get_current_user

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
    responses={404: {"description": "Not found"}},
)


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, session: SessionDep) -> Token:
    existing_user = auth_service.get_user(session, user_data.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User already exists",
        )

    hashed_password = auth_service.get_password_hash(user_data.password)
    db_user = User(
        username=user_data.username,
        hashed_password=hashed_password,
        email=user_data.email,
    )

    session.add(db_user)
    session.commit()
    session.refresh(db_user)

    access_token = auth_service.create_access_token(data={"sub": user_data.username})
    return Token(access_token=access_token, token_type="bearer")


@router.post("/login")
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()], session: SessionDep
) -> Token:
    user = auth_service.authenticate_user(
        session, form_data.username, form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = auth_service.create_access_token(data={"sub": user.username})
    return Token(access_token=access_token, token_type="bearer")


@router.post("/logout")
async def logout() -> dict:
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserPublic)
async def me(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user
