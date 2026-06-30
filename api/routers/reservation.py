from fastapi import APIRouter, status

from api.models.reservation import Reservation, ReservationCreate, ReservationCreateStaff, ReservationUpdate, ReservationUpdateStatus, ReservationUpdateHolder

from api.service.reservation import create_reservation_guest, create_reservation_staff, get_res_by_id, get_all_res, get_all_res_by_user, update_res, update_res_status, update_res_holder, delete_res

from api.utils.db.dependencies import user_repo, room_repo, reservation_repo, notification_repo
from api.utils.security.dependencies import guest_user, company_user, session_user

router = APIRouter(prefix="/reservations", tags=["reservations"])

@router.post("", response_model= Reservation , status_code = status.HTTP_201_CREATED)
async def create_resservation_by_guest(reservation_data: ReservationCreate, room_repo: room_repo, reservation_repo: reservation_repo, noti_repo: notification_repo, user_repo: user_repo, _: guest_user):
    return create_reservation_guest(reservation_data, room_repo, reservation_repo, noti_repo, user_repo)

@router.post("/staff", response_model = Reservation, status_code = status.HTTP_201_CREATED)
async def create_resservation_by_staff(reservation_data: ReservationCreateStaff, user_repo: user_repo, room_repo: room_repo, reservation_repo: reservation_repo, noti_repo: notification_repo, _: company_user):
    return create_reservation_staff(reservation_data, user_repo, room_repo, reservation_repo, noti_repo)

@router.get("/me", response_model=list[Reservation], status_code=status.HTTP_200_OK)
async def get_my_reservations(repo: reservation_repo, payload: session_user):
    return get_all_res_by_user(payload["id"], repo)

@router.get("/{reservation_id}", response_model=Reservation)
async def get_reservation_by_id(reservation_id: int, repo: reservation_repo):
    return get_res_by_id(reservation_id, repo)

@router.get("", response_model= list[Reservation])
async def get_all_reservations(repo: reservation_repo, _: company_user):
    return get_all_res(repo)

@router.patch("/{reservation_id}", response_model = Reservation, status_code=status.HTTP_200_OK)
async def update_reservation(reservation_id: int, reservation_data: ReservationUpdate, res_repo: reservation_repo, noti_repo: notification_repo, user_repo: user_repo):
    return update_res(reservation_id, reservation_data, res_repo, noti_repo, user_repo)

@router.patch("/{reservation_id}/status", response_model=Reservation, status_code=status.HTTP_200_OK)
async def update_reservation_status(reservation_id: int, data_status: ReservationUpdateStatus, res_repo: reservation_repo, noti_repo: notification_repo, user_repo: user_repo, _: company_user):
    return update_res_status(reservation_id, data_status.status, res_repo, noti_repo, user_repo)

@router.patch("/{reservation_id}/holder", response_model=Reservation, status_code=status.HTTP_200_OK)
async def update_reservation_holder(reservation_id: int, data_holder: ReservationUpdateHolder, res_repo: reservation_repo, noti_repo: notification_repo, user_repo: user_repo, _: company_user):
    return update_res_holder(reservation_id, data_holder.new_email, res_repo, noti_repo, user_repo)

@router.delete("/{reservation_id}")
async def delete_reservation(reservation_id: int, res_repo: reservation_repo, noti_repo: notification_repo, _: company_user):
    return delete_res(reservation_id, res_repo, noti_repo)
