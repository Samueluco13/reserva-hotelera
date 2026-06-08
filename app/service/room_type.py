from app.repositories.room_type import RoomTypeRepository

from ..utils.errors import not_found_error

def create_rt(room_type_data, repo: RoomTypeRepository):
    room_type = repo.create(room_type_data)
    return room_type

def get_rt_by_id(room_type_id: int, repo: RoomTypeRepository):
    room_type = repo.get_by_id(room_type_id)
    return room_type

def get_rt_by_name(room_type_name: str, repo: RoomTypeRepository):
    room_type = repo.get_by_name(room_type_name)
    return room_type

def get_all_rt(repo: RoomTypeRepository):
    room_types = repo.get_all()
    return room_types

def update_rt(room_type_name: str, room_type_data, repo: RoomTypeRepository):
    room_type_db = repo.get_by_name(room_type_name)
    room_type = repo.update(room_type_db, room_type_data)
    return room_type

def delete_rt(room_type_name: str, repo: RoomTypeRepository):
    room_type = repo.get_by_name(room_type_name)
    repo.delete(room_type)
    return {"message": "Room type deleted successfully"}
