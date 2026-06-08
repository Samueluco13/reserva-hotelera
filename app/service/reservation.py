from app.models.user import User
from app.models.room import Room

from app.repositories.user import UserRepository
from app.repositories.room import RoomRepository
from app.repositories.reservation import ReservationRepository

from app.utils.errors import not_found_error

"""Funcion que ayuda a crear una reserva, se utiliza en la creacion por parte de staff y por parte del mismo usuario"""
def _creation_helper(reservation_data, user_id, room_repo: RoomRepository, reservation_repo: ReservationRepository):
    room = room_repo.get_by_number(reservation_data.room_number)
    if not room:
        not_found_error(Room, "room")
    
    reservation_data_dict = {
        "checkin_date": reservation_data.checkin_date,
        "checkout_date": reservation_data.checkout_date,
        "room_number": room.number,
        "user_id": user_id
    }

    reservation = reservation_repo.create(reservation_data_dict)
    return reservation

def create_reservation_user(reservation_data, room_repo: RoomRepository, reservation_repo: ReservationRepository): 
    reservation = _creation_helper(reservation_data, reservation_data.user_id, room_repo, reservation_repo)
    return reservation

def create_reservation_staff(reservation_data, user_repo: UserRepository, room_repo: RoomRepository, reservation_repo: ReservationRepository):
    user = user_repo.get_by_email(reservation_data.user_email)
    if not user:
        not_found_error(User, "user")
    reservation = _creation_helper(reservation_data, user.id, room_repo, reservation_repo)
    return reservation

def get_res_by_id(reservation_id: int, repo: ReservationRepository):
    reservation = repo.get_by_id(reservation_id)
    return reservation

def get_all_res(repo: ReservationRepository):
    reservations = repo.get_all()
    if not reservations:
        not_found_error(list, "reservation")
    return reservations

def update_res(reservation_id: int, reservation_data, repo: ReservationRepository):
    reservation_db = repo.get_by_id(reservation_id)
    reservation = repo.update(reservation_db, reservation_data)
    return reservation

def delete_res(reservation_id: int, repo: ReservationRepository):
    reservation_to_delete = repo.get_by_id(reservation_id)
    repo.delete(reservation_to_delete)
    return {"message": "Reservation deleted successfully"}