from pydantic import BaseModel, EmailStr

class GuestBase(BaseModel):
    first_name: str
    last_name: str
    phone_number: str
    email: EmailStr

class GuestCreate(GuestBase):
    pass

class Guest(GuestBase):
    id: int | None = None