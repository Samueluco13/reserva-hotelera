from fastapi import APIRouter, Depends, status

from app.db import session
from ..models.reservation import Reservation, ReservationCreate, ReservationUpdate

from ..utils.errors import not_found_error

from app.repositories.reservation import ReservationRepository

router = APIRouter(prefix="/reservations", tags=["reservations"])

def get_reservation_repository(session: session):
    return ReservationRepository(session)

@router.post("", response_model= Reservation , status_code = status.HTTP_201_CREATED)
async def create_reservation(reservation_data: ReservationCreate, repo: ReservationRepository = Depends(get_reservation_repository)):
    reservation = repo.create(reservation_data)
    return reservation

@router.get("/{reservation_id}", response_model=Reservation)
async def get_reservation_by_id(reservation_id: int, repo: ReservationRepository = Depends(get_reservation_repository)):
    reservation = repo.get_by_id(reservation_id)
    if not reservation:
        not_found_error(Reservation, "reservation")
    return reservation

@router.get("", response_model= list[Reservation])
async def get_all_reservations(repo: ReservationRepository = Depends(get_reservation_repository)):
    reservations = repo.get_all()
    if not reservations:
        not_found_error(list, "reservation")
    return reservations

@router.delete("/{reservation_id}")
async def delete_reservation_by_id(reservation_id: int, repo: ReservationRepository = Depends(get_reservation_repository)):
    deleted = repo.delete(reservation_id)
    if not deleted:
        not_found_error(Reservation, "reservation")
    return {"message" : "Reservation deleted successfully"}

@router.patch("/{reservation_id}", response_model = Reservation, status_code=status.HTTP_200_OK)
async def update_reservation_by_id(reservation_id: int, reservation: ReservationUpdate, repo: ReservationRepository = Depends(get_reservation_repository)):
    reservation_db = repo.update(reservation_id, reservation)
    if not reservation_db:
        not_found_error(Reservation, "reservation")
        return reservation_db