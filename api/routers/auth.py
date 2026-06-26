from typing import Annotated
from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm

from api.models.user import User, UserCreate
from api.models.auth import TokenResponse

from api.utils.db.dependencies import user_repo

from api.service.auth import register_user, login_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, repo: user_repo):
    return register_user(user_data, repo)

@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], repo: user_repo):
    #Esta dependencia permite el acceso a los atributos del formulario como si fuera un objeto
    return login_user(form_data.username, form_data.password, repo)