from fastapi import APIRouter, status
from sqlmodel import select

from app.db import session
from ..models.room_type import RoomType, RoomTypeCreate, RoomTypeUpdate

from ..utils.errors import not_found_error

router = APIRouter(prefix="/room_types", tags=["room_types"])

@router.post("", response_model=RoomType, status_code=status.HTTP_200_OK)
async def create_room_type(room_type_data: RoomTypeCreate, session: session):
    dict_room_type = room_type_data.model_dump()
    room_type = RoomType.model_validate(dict_room_type)
    session.add(room_type)
    session.commit()
    session.refresh(room_type)
    return room_type

@router.get("/{room_type_id}", response_model=RoomType, status_code = status.HTTP_200_OK)
async def get_room_type_by_id(room_type_id: int, session: session):
    room_type = session.get(RoomType, room_type_id)
    if not room_type:
        not_found_error(RoomType, "room type")
    return room_type

@router.get("", response_model= list[RoomType], status_code = status.HTTP_200_OK)
async def get_all_room_types(session: session):
    room_types = session.exec(select(RoomType)).all()
    if not room_types:
        not_found_error(list, "room type")
    return room_types

@router.delete("/{room_type_id}", status_code=status.HTTP_200_OK)
async def delete_rrom_type(room_type_id: int, session: session):
    room_type = session.get(RoomType, room_type_id)
    if not room_type:
        not_found_error(RoomType, "room type")
    session.delete(room_type)
    session.commit()
    session.refresh(room_type)
    return {"message" : "Room type deleted successfully"}

@router.patch("/{room_type_id}", response_model=RoomType, status_code=status.HTTP_200_OK)
async def update_room_type(room_type_id: int, room_type_data: RoomTypeUpdate, session: session):
    room_type_db = session.get(RoomType, room_type_id)
    if not room_type_db:
        not_found_error(RoomType, "room type")
    room_type_dict = room_type_data.model_dump()
    room_type_db.sqlmodel_update(room_type_dict)

    session.add(room_type_db)
    session.commit()
    session.refresh(room_type_db)
    return room_type_db

