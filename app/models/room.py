from pydantic import BaseModel

class Room(BaseModel):
    number: int
    status: str
    type_id: int