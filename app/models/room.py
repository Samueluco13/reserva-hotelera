from enum import Enum

# from .room_type import RoomType
# from .reservation import Reservation

from sqlmodel import SQLModel, Field, Relationship

class StatusEnum(str, Enum):
    RESERVED = "reserved"
    OCCUPIED = "occupied"
    AVAILABLE = "available"

class RoomBase(SQLModel):
    status: StatusEnum = Field(default = StatusEnum.AVAILABLE)

class RoomCreate(RoomBase):
    pass

class Room(RoomBase, table = True):
    __tablename__ = "room"
    number: int = Field(primary_key=True)

    reservations: list["Reservation"] = Relationship(back_populates="room") #Relación que se crea con la tabla "reservation"

    type_id: int = Field(foreign_key="room_type.id") #Llave foranea hacia la tabla "room_type"
    room_type: "RoomType" = Relationship(back_populates="rooms") #Relación que se crea con la tabla "reservation"

#Se deben importar al final para la importación circular
from .room_type import RoomType
from .reservation import Reservation