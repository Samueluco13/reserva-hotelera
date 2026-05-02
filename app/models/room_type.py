# from .room import Room

from sqlmodel import SQLModel, Field, Relationship

class RoomTypeBase(SQLModel):
    name: str = Field(unique=True)
    price: float

class RoomTypeCreate(RoomTypeBase):
    pass

class RoomType(RoomTypeBase, table = True):
    __tablename__ = "room_type" #Se especifica el nombre de la tabla a como se encuentra en la base de datos
    id: int | None = Field(default=None, primary_key=True)
    rooms: list["Room"] = Relationship(back_populates="room_type") #Relación que se crea con la tabla "room"

#Se debe importar al final para la importación circular
from .room import Room