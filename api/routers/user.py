from fastapi import APIRouter, status
from pydantic import EmailStr

from api.models.user import User, UserCreate, UserUpdate

from api.service.user import create_u, get_all_u, get_u_by_email, get_u_by_id, update_u, delete_u

from api.utils.db.dependencies import user_repo

from api.utils.security.dependencies import admin_user, company_user, session_user


router = APIRouter(prefix="/users", tags=["users"])


@router.post("", response_model=User, status_code=status.HTTP_201_CREATED)
async def create_user(user_data: UserCreate, repo: user_repo, _: admin_user):
    return create_u(user_data, repo)


@router.get("", response_model=list[User], status_code=status.HTTP_200_OK)
async def get_all_users(repo: user_repo, _: company_user):
    return get_all_u(repo)


@router.get("/email/{user_email}", response_model=User, status_code=status.HTTP_200_OK)
async def get_user_by_email(user_email: EmailStr, repo: user_repo, _: company_user):
    return get_u_by_email(user_email, repo)


@router.get("/me", response_model=User, status_code=status.HTTP_200_OK)
async def get_me(repo: user_repo, payload: session_user):
    return get_u_by_id(payload["id"], repo)


@router.patch("", response_model=User, status_code=status.HTTP_200_OK)
async def update_me(user_data: UserUpdate, repo: user_repo, payload: session_user):
    return update_u(payload["id"], user_data, repo)


@router.get("/{user_id}", response_model=User, status_code=status.HTTP_200_OK)
async def get_user_by_id(user_id: int, repo: user_repo, _: company_user):
    return get_u_by_id(user_id, repo)


@router.patch("/{user_id}", response_model=User, status_code=status.HTTP_200_OK)
async def update_user(user_id: int, user_data: UserUpdate, repo: user_repo, _: company_user):
    return update_u(user_id, user_data, repo)


@router.delete("/{user_id}", status_code=status.HTTP_200_OK)
async def delete_user_by_id(user_id: int, repo: user_repo, _: company_user):
    return delete_u(user_id, repo)
