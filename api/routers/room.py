from fastapi import APIRouter, status

from ..models.room import Room, RoomCreate, RoomUpdate

from api.utils.db.dependencies import room_repo, room_type_repo

from api.service.room import create_r, get_r_by_number, get_all_r, update_r, delete_r

router = APIRouter(prefix="/rooms", tags=["rooms"])

@router.post("", response_model=Room, status_code=status.HTTP_201_CREATED)
async def create_room(room_data:  RoomCreate, room_repo: room_repo, room_type_repo: room_type_repo):
    return create_r(room_data, room_repo, room_type_repo)

@router.get("/{room_number}", response_model=Room, status_code=status.HTTP_200_OK)
async def get_room_by_number(room_number: int, repo: room_repo):
    return get_r_by_number(room_number, repo)

@router.get("", response_model= list[Room], status_code=status.HTTP_200_OK)
async def get_all_rooms(repo: room_repo):
    return get_all_r(repo)

@router.patch("/{room_number}", response_model = Room, status_code=status.HTTP_200_OK)
async def update_room_by_id(room_number: int, room_data: RoomUpdate , room_repo: room_repo, room_type_repo: room_type_repo):
    return update_r(room_number, room_data, room_repo, room_type_repo)

@router.delete("/{room_number}", status_code=status.HTTP_200_OK)
async def delete_room_by_id(room_number: int, repo: room_repo):
    delete_r(room_number, repo)
    return {"message" : "Room deleted successfully"}