from fastapi import APIRouter, status
from fastapi.params import Depends
from sqlmodel import select

from app.db import session
from ..models.room_type import RoomType, RoomTypeCreate, RoomTypeUpdate

from ..utils.errors import not_found_error

from app.repositories.room_type import RoomTypeRepository

router = APIRouter(prefix="/room_types", tags=["room_types"])

def get_room_type_repository(session: session):
    return RoomTypeRepository(session)

@router.post("", response_model=RoomType, status_code=status.HTTP_200_OK)
async def create_room_type(room_type_data: RoomTypeCreate, repo: RoomTypeRepository = Depends(get_room_type_repository)):
    return repo.create(room_type_data)

@router.get("/{room_type_id}", response_model=RoomType, status_code = status.HTTP_200_OK)
async def get_room_type_by_id(room_type_id: int, repo: RoomTypeRepository = Depends(get_room_type_repository)):
    room_type = repo.get_by_id(room_type_id)
    if not room_type:
        not_found_error(RoomType, "room type")
    return room_type

@router.get("", response_model= list[RoomType], status_code = status.HTTP_200_OK)
async def get_all_room_types(repo: RoomTypeRepository = Depends(get_room_type_repository)):
    room_types = repo.get_all()
    if not room_types:
        not_found_error(list, "room type")
    return room_types

@router.delete("/{room_type_id}", status_code=status.HTTP_200_OK)
async def delete_rrom_type(room_type_id: int, repo: RoomTypeRepository = Depends(get_room_type_repository)):
    deleted = repo.delete(room_type_id)
    if not deleted:
        not_found_error(RoomType, "room type")
    return {"message" : "Room type deleted successfully"}

@router.patch("/{room_type_id}", response_model=RoomType, status_code=status.HTTP_200_OK)
async def update_room_type(room_type_id: int, room_type_data: RoomTypeUpdate, repo: RoomTypeRepository = Depends(get_room_type_repository)):
    room_type_db = repo.update(room_type_id, room_type_data)
    if not room_type_db:
        not_found_error(RoomType, "room type")
    return room_type_db

