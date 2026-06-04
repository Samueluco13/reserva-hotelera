from fastapi import APIRouter, status, Depends
from pydantic import EmailStr
from sqlmodel import Session

from app.db import get_session
from app.repositories.user_repository import UserRepository
from ..models.user import User, UserCreate, UserUpdate
from ..utils.errors import not_found_error

router = APIRouter(prefix="/users", tags=["users"])


def get_user_repository(session: Session = Depends(get_session)) -> UserRepository:
    """Dependency to inject UserRepository"""
    return UserRepository(session)


@router.post("", response_model=User, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, repo: UserRepository = Depends(get_user_repository)):
    return repo.create(user)


@router.get("", response_model=list[User], status_code=status.HTTP_200_OK)
async def get_all_users(repo: UserRepository = Depends(get_user_repository)):
    users = repo.get_all()
    if not users:
        not_found_error(list, "user")
    return users


@router.get("/email/{user_email}", response_model=User, status_code=status.HTTP_200_OK)
async def get_user_by_email(user_email: EmailStr, repo: UserRepository = Depends(get_user_repository)):
    user_db = repo.get_by_email(user_email)
    if not user_db:
        not_found_error(User, "user")
    return user_db


@router.get("/{user_id}", response_model=User, status_code=status.HTTP_200_OK)
async def get_user_by_id(user_id: int, repo: UserRepository = Depends(get_user_repository)):
    user = repo.get_by_id(user_id)
    if not user:
        not_found_error(User, "user")
    return user


@router.patch("/{user_id}", response_model=User, status_code=status.HTTP_200_OK)
async def update_user(user_id: int, user: UserUpdate, repo: UserRepository = Depends(get_user_repository)):
    user_db = repo.update(user_id, user)
    if not user_db:
        not_found_error(User, "user")
    return user_db


@router.delete("/{user_id}", status_code=status.HTTP_200_OK)
async def delete_user_by_id(user_id: int, repo: UserRepository = Depends(get_user_repository)):
    deleted = repo.delete(user_id)
    if not deleted:
        not_found_error(User, "user")
    return {"message": "User deleted successfully"}
