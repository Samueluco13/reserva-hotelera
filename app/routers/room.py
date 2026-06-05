from fastapi import APIRouter, Depends, status

from app.db import session
from ..models.room import Room, RoomCreate, RoomUpdate

from ..utils.errors import not_found_error

from app.repositories.room import RoomRepository

router = APIRouter(prefix="/rooms", tags=["rooms"])

def get_room_repository(session: session):
    return RoomRepository(session)

@router.post("", response_model=Room, status_code=status.HTTP_201_CREATED)
async def create_room(room_data:  RoomCreate, repo: RoomRepository = Depends(get_room_repository)):
    room = repo.create(room_data)
    return room

@router.get("/{room_number}", response_model=Room, status_code=status.HTTP_200_OK)
async def get_room_by_number(room_number: int, repo: RoomRepository = Depends(get_room_repository)):
    room = repo.get_by_number(room_number)
    if not room:
        not_found_error(Room, "room")
    return room

@router.get("", response_model= list[Room], status_code=status.HTTP_200_OK)
async def get_all_rooms(repo: RoomRepository = Depends(get_room_repository)):
    rooms = repo.get_all()
    if not rooms:
        not_found_error(list, "room")
    return rooms

@router.delete("/{room_number}", status_code=status.HTTP_200_OK)
async def delete_room_by_id(room_number: int, repo: RoomRepository = Depends(get_room_repository)):
    deleted = repo.delete(room_number)
    if not deleted:
        not_found_error(Room, "room")
    return {"message" : "Room deleted successfully"}

@router.patch("/{room_number}", response_model = Room, status_code=status.HTTP_200_OK)
async def update_room_by_id(room_number: int, room_data: RoomUpdate , repo: RoomRepository = Depends(get_room_repository)):
    room_db = repo.update(room_number, room_data)
    if not room_db:
        not_found_error(Room, "room")
    return room_db