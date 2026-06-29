from fastapi import APIRouter, status

from ..models.room_type import RoomType, RoomTypeCreate, RoomTypeUpdate

from api.service.room_type import create_rt, get_rt_by_id, get_rt_by_name, get_all_rt, update_rt, delete_rt

from api.utils.db.dependencies import room_type_repo
from api.utils.security.dependencies import company_user

router = APIRouter(prefix="/room_types", tags=["room_types"])
@router.post("", response_model=RoomType, status_code=status.HTTP_200_OK)
async def create_room_type(room_type_data: RoomTypeCreate, repo: room_type_repo, _: company_user):
    return create_rt(room_type_data, repo)

@router.get("/{room_type_id}", response_model=RoomType, status_code = status.HTTP_200_OK)
async def get_room_type_by_id(room_type_id: int, repo: room_type_repo, _: company_user):
    return get_rt_by_id(room_type_id, repo)

@router.get("/name/{room_type_name}", response_model=RoomType, status_code = status.HTTP_200_OK)
async def get_room_type_by_name(room_type_name: str, repo: room_type_repo, _: company_user):
    return get_rt_by_name(room_type_name, repo)

@router.get("", response_model= list[RoomType], status_code = status.HTTP_200_OK)
async def get_all_room_types(repo: room_type_repo):
    return get_all_rt(repo)

@router.patch("/{room_type_name}", response_model=RoomType, status_code=status.HTTP_200_OK)
async def update_room_type(room_type_name: str, room_type_data: RoomTypeUpdate, repo: room_type_repo, _: company_user):
    return update_rt(room_type_name, room_type_data, repo)

@router.delete("/{room_type_name}", status_code=status.HTTP_200_OK)
async def delete_room_type(room_type_name: str, repo: room_type_repo, _: company_user):
    return delete_rt(room_type_name, repo)