from enum import Enum

from sqlmodel import SQLModel, Field, Relationship

"""Modelo para las opciones del ENUM del estado de la habitación"""
class StatusEnum(str, Enum):
    reserved = "reserved"
    occupied = "occupied"
    available = "available"

class RoomBase(SQLModel):
    status: StatusEnum = Field(default = StatusEnum.available)

class RoomCreate(RoomBase):
    pass

"""Modelo para actualizar el estado de la habitación"""
class RoomUpdate(RoomBase):
    status: StatusEnum | None = None

class Room(RoomBase, table = True):
    __tablename__ = "room"
    number: int = Field(primary_key=True)

    reservations: list["Reservation"] = Relationship(back_populates="room") #Relación que se crea con la tabla "reservation"

    type_id: int = Field(foreign_key="room_type.id") #Llave foranea hacia la tabla "room_type"
    room_type: "RoomType" = Relationship(back_populates="rooms") #Relación que se crea con la tabla "reservation"

#Se deben importar al final para la importación circular
from .room_type import RoomType
from .reservation import Reservation