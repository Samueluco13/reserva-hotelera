from app.utils.dependencies import room_repo
from app.exceptions.not_found_exception import NotFoundRoom

from app.repositories.room_type import RoomTypeRepository

from app.service.room_type import get_rt_by_id

def create_r(room_data, room_repo: room_repo, room_typ_repo: RoomTypeRepository):
    get_rt_by_id(room_data.type_id, room_typ_repo)
    room = room_repo.create(room_data)
    return room

def get_r_by_number(room_number, repo: room_repo):
    room = repo.get_by_number(room_number)
    if not room:
        NotFoundRoom(room_number)
    return room

def get_all_r(repo: room_repo):
    rooms = repo.get_all()
    return rooms

def update_r(room_number: int, room_data, room_repo: room_repo, room_type_repo: RoomTypeRepository):
    get_rt_by_id(room_data.type_id, room_type_repo)
    room_db = room_repo.get_by_number(room_number)
    if not room_db:
        NotFoundRoom(room_number)
    room = room_repo.update(room_db, room_data)
    return room

def delete_r(room_number, repo: room_repo):
    room_to_delete = repo.get_by_number(room_number)
    if not room_to_delete:
        NotFoundRoom(room_number)
    repo.delete(room_to_delete)
    return {"message": "Room deleted succesfully"}