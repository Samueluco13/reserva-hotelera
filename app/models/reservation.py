from datetime import datetime
from enum import Enum

from sqlmodel import SQLModel, Field, Relationship

"""Modelo para las opciones del ENUM del estado de la reserva"""
class StatusEnum(str, Enum):
    active = "active"
    cancelled = "cancelled"
    completed = "completed"

class ReservationBase(SQLModel):
    created_at: datetime = Field(default_factory=datetime.now())
    checkin_date: datetime | None = None
    checkout_date: datetime | None = None
    status: StatusEnum = Field(default=StatusEnum.active)
    room_number: int = Field(foreign_key="room.number") #Llave foranea hacia la tabla "room"
    user_id: int = Field(foreign_key="user.id") #Llave foranea hacia la tabla "user"

class ReservationCreate(ReservationBase):
    pass

class ReservationUpdate(ReservationBase):
    created_at: datetime | None = None
    status: StatusEnum | None = None
    room_number: int | None = None
    user_id: int | None = None

class Reservation(ReservationBase, table = True):
    __tablename__ = "reservation"
    id: int | None  = Field(default=None, primary_key=True)

    room: "Room" = Relationship(back_populates="reservations") #Relación que se crea con la tabla "room"

    user: "User" = Relationship(back_populates="reservations") #Relación que se crea con la tabla "user"

#Se deben importar al final para la importación circular
from .user import User
from .room import Room