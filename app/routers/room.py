from fastapi import APIRouter, status
from sqlmodel import select

from app.db import session
from ..models.room import Room, RoomCreate, RoomUpdate

from ..utils.errors import not_found_error

router = APIRouter(prefix="/rooms", tags=["rooms"])

@router.post("", response_model=Room, status_code=status.HTTP_201_CREATED)
async def create_room(room_data:  RoomCreate, session: session):
    room_dict = room_data.model_dump()
    room = Room.model_validate(room_dict)
    session.add(room)
    session.commit()
    session.refresh(room)
    return room

@router.get("/{room_number}", response_model=Room, status_code=status.HTTP_200_OK)
async def get_room_by_number(room_number: int, session: session):
    room = session.get(Room, room_number)
    if not room:
        not_found_error(Room, "room")
    return room

@router.get("", response_model= list[Room], status_code=status.HTTP_200_OK)
async def get_all_rooms(session: session):
    rooms = session.exec(select(Room)).all()
    if not rooms:
        not_found_error(list, "room")
    return rooms

@router.delete("/{room_number}", status_code=status.HTTP_200_OK)
async def delete_room_by_id(room_number: int, session: session):
    room = session.get(Room, room_number)
    if not room:
        not_found_error(Room, "room")
    session.delete(room)
    session.commit()
    return {"message" : "Room deleted successfully"}

@router.patch("/{room_number}", status_code=status.HTTP_200_OK)
async def update_room_by_id(room_number: int, room: RoomUpdate , session: session):
    room_db = session.get(Room, room_number)
    if not room_db:
        not_found_error(Room, "room")
    
    room_data_dict = room.model_dump()
    room_db.sqlmodel_update(room_data_dict)

    session.add(room_db)
    session.commit()
    session.refresh(room_db)
    return room_db