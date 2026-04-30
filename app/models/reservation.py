from datetime import datetime

from pydantic import BaseModel

class ReservationBase(BaseModel):
    created_at: datetime
    checkin_date: datetime
    checkout_date: datetime
    status: str
    room_number: int
    guest_id: int

class ReservationCreate(ReservationBase):
    pass

class Reservation(ReservationBase):
    id: int | None = None