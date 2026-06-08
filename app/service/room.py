from app.utils.dependencies import room_repo

def create_r(room_data, repo: room_repo):
    room = repo.create(room_data)
    return room

def get_r_by_number(room_number, repo: room_repo):
    room = repo.get_by_number(room_number)
    return room

def get_all_r(repo: room_repo):
    rooms = repo.get_all()
    return rooms

def update_r(room_number: int, room_data, repo: room_repo):
    room_db = repo.get_by_number(room_number)
    room = repo.update(room_db, room_data)
    return room

def delete_r(room_number, repo: room_repo):
    room_to_delete = repo.get_by_number(room_number)
    repo.delete(room_to_delete)
    return {"message": "Room deleted succesfully"}