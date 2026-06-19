from fastapi import APIRouter, status
from pydantic import EmailStr

from ..models.user import User, UserCreate, UserUpdate

from app.service.user import create_u, get_all_u, get_u_by_email, get_u_by_id, update_u, delete_u

from app.utils.dependencies import user_repo


router = APIRouter(prefix="/users", tags=["users"])


@router.post("", response_model=User, status_code=status.HTTP_201_CREATED)
async def create_user(user_data: UserCreate, repo: user_repo):
    return create_u(user_data, repo)


@router.get("", response_model=list[User], status_code=status.HTTP_200_OK)
async def get_all_users(repo: user_repo):
    return get_all_u(repo)


@router.get("/email/{user_email}", response_model=User, status_code=status.HTTP_200_OK)
async def get_user_by_email(user_email: EmailStr, repo: user_repo):
    return get_u_by_email(user_email, repo)


@router.get("/{user_id}", response_model=User, status_code=status.HTTP_200_OK)
async def get_user_by_id(user_id: int, repo: user_repo):
    return get_u_by_id(user_id, repo)


@router.patch("/{user_id}", response_model=User, status_code=status.HTTP_200_OK)
async def update_user(user_id: int, user_data: UserUpdate, repo: user_repo):
    return update_u(user_id, user_data, repo)



@router.delete("/{user_id}", status_code=status.HTTP_200_OK)
async def delete_user_by_id(user_id: int, repo: user_repo):
    return delete_u(user_id, repo)
