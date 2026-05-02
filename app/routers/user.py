from fastapi import APIRouter, HTTPException, status
from sqlmodel import select

from app.db import session
from ..models.user import User, UserCreate


router = APIRouter(prefix="/users", tags=["users"])

@router.post("", response_model=User, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, session: session):
    dict_user = user.model_dump()
    db_user = User.model_validate(dict_user)

    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user

@router.get("/{user_id}", response_model=User, status_code = status.HTTP_200_OK)
async def get_user_by_id(user_id: int, session: session):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND, detail = "User not found")
    return user

@router.get("", response_model = list[User], status_code = status.HTTP_200_OK)
async def get_all_users(session: session):
    users = session.exec(select(User)).all()
    if not users:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND, detail = "There are no users")
    return users

@router.delete("/{user_id}", status_code = status.HTTP_200_OK)
async def delete_user_by_id(user_id: int, session: session):
    user_to_delete = session.get(User, user_id)
    if not user_to_delete:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND, detail = "User not found")
    
    session.delete(user_to_delete)
    session.commit()
    return {"message": "User deleted successfully"}

@router.patch("/{user_id}", status_code = status.HTTP_200_OK)
async def update_user(user_id: int, user: UserCreate, session: session):
    user_db = session.get(User, user_id)
    if not user_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail = "User not found")
    
    user_dict = user.model_dump(exclude_unset=True)
    user_db.sqlmodel_update(user_dict)
    
    session.add(user_db)
    session.commit()
    session.refresh(user_db)
    return user_db