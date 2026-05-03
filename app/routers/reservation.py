from fastapi import APIRouter, status
from sqlmodel import select

from app.db import session
from ..models.reservation import Reservation, ReservationCreate, ReservationUpdate

from ..utils.errors import not_found_error

router = APIRouter(prefix="/reservations", tags=["reservations"])

@router.post("", response_model= Reservation , status_code = status.HTTP_201_CREATED)
async def create_reservation(reservation_data: ReservationCreate, session: session):
    dict_reservation = reservation_data.model_dump()
    reservation = Reservation.model_validate(dict_reservation)
    session.add(reservation)
    session.commit()
    session.refresh(reservation)
    return  reservation

@router.get("/{reservation_id}", response_model=Reservation)
async def get_reservation_by_id(reservation_id: int ,session: session):
    reservation = session.get(Reservation, reservation_id)
    if not reservation:
        not_found_error(Reservation, "reservation")
    return reservation

@router.get("", response_model= list[Reservation])
async def get_all_reservations(session: session):
    reservations = session.exec(select(Reservation)).all()
    if not reservations:
        not_found_error(list, "reservation")
    return reservations

@router.delete("/{reservation_id}")
async def delete_reservation_by_id(reservation_id: int, session: session):
    reservation = session.get(Reservation, reservation_id)
    if not reservation:
        not_found_error(Reservation, "reservation")
    session.delete(reservation)
    session.commit()
    return {"message" : "Reservation deleted successfully"}

@router.patch("/{reservation_id}", response_model = Reservation, status_code=status.HTTP_200_OK)
async def update_reservation_by_id(reservation_id: int, reservation: ReservationUpdate, session: session):
    reservation_db = session.get(Reservation, reservation_id)
    if not reservation_db:
        not_found_error(Reservation, "reservation")

    reservation_data_dict = reservation.model_dump(exclude_unset=True)
    reservation_db.sqlmodel_update(reservation_data_dict)
    
    session.add(reservation_db)
    session.commit()
    session.refresh(reservation_db)
    return reservation_db