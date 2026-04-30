from pydantic import BaseModel

class RoomTypeBase(BaseModel):
    type: int
    price: float

class RoomTypeCreate(RoomTypeBase):
    pass

class RoomType(RoomTypeBase):
    id: int | None = None