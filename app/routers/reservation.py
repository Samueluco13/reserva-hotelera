from fastapi import APIRouter, status

from ..models.reservation import Reservation, ReservationCreate, ReservationCreateStaff, ReservationUpdate, StatusEnum

from ..utils.errors import not_found_error

from app.service.reservation import create_reservation_user, create_reservation_staff, get_res_by_id, get_all_res, update_res, update_res_status, delete_res
from app.utils.dependencies import user_repo, room_repo, reservation_repo, notification_repo

router = APIRouter(prefix="/reservations", tags=["reservations"])

@router.post("", response_model= Reservation , status_code = status.HTTP_201_CREATED)
async def create_resservation_by_user(reservation_data: ReservationCreate, room_repo: room_repo, reservation_repo: reservation_repo, noti_repo: notification_repo, user_repo: user_repo):
    return create_reservation_user(reservation_data, room_repo, reservation_repo, noti_repo, user_repo)

@router.post("/staff", response_model = Reservation, status_code = status.HTTP_201_CREATED)
async def create_resservation_by_staff(reservation_data: ReservationCreateStaff, user_repo: user_repo, room_repo: room_repo, reservation_repo: reservation_repo, noti_repo: notification_repo):
    return create_reservation_staff(reservation_data, user_repo, room_repo, reservation_repo, noti_repo)

@router.get("/{reservation_id}", response_model=Reservation)
async def get_reservation_by_id(reservation_id: int, repo: reservation_repo):
    return get_res_by_id(reservation_id, repo)

@router.get("", response_model= list[Reservation])
async def get_all_reservations(repo: reservation_repo):
    return get_all_res(repo)

@router.patch("/{reservation_id}", response_model = Reservation, status_code=status.HTTP_200_OK)
async def update_reservation(reservation_id: int, reservation_data: ReservationUpdate, res_repo: reservation_repo, noti_repo: notification_repo):
    return update_res(reservation_id, reservation_data, res_repo, noti_repo)
    
@router.patch("/{reservation_id}/{new_status}", response_model=Reservation, status_code=status.HTTP_200_OK)
async def update_reservation_status(reservation_id: int, new_status: StatusEnum, res_repo: reservation_repo, noti_repo: notification_repo):
    return update_res_status(reservation_id, new_status, res_repo, noti_repo)

@router.delete("/{reservation_id}")
async def delete_reservation(reservation_id: int, res_repo: reservation_repo, noti_repo: notification_repo):
    return delete_res(reservation_id, res_repo, noti_repo)
