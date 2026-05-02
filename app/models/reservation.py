from datetime import datetime
from enum import Enum

from sqlmodel import SQLModel, Field, Relationship

"""Modelo para las opciones del ENUM del estado de la reserva"""
class StatusEnum(str, Enum):
    ACTIVE = "active"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

class ReservationBase(SQLModel):
    created_at: datetime = Field(default_factory=datetime.now())
    checkin_date: datetime | None = None
    checkout_date: datetime | None = None
    status: StatusEnum = Field(default=StatusEnum.ACTIVE)

class ReservationCreate(ReservationBase):
    pass

class Reservation(ReservationBase, table = True):
    __tablename__ = "reservation"
    id: int | None  = Field(default=None, primary_key=True)

    room_number: int = Field(foreign_key="room.number") #Llave foranea hacia la tabla "room"
    room: "Room" = Relationship(back_populates="reservations") #Relación que se crea con la tabla "room"

    user_id: int = Field(foreign_key="user.id") #Llave foranea hacia la tabla "user"
    user: "User" = Relationship(back_populates="reservations") #Relación que se crea con la tabla "user"

#Se deben importar al final para la importación circular
from .user import User
from .room import Room