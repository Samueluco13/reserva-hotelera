from enum import Enum

from reservation import Reservation
from notification import Notification

from pydantic import EmailStr
from sqlmodel import SQLModel, Field, Relationship

"""Modelo para las opciones del ENUM del rol de usuario"""
class RoleEnum(str, Enum):
    GUEST = "guest"
    STAFF = "staff"
    ADMIN = "admin"

class UserBase(SQLModel):
    first_name: str = Field(max_length=30)
    last_name: str = Field(max_length=150)
    email: EmailStr = Field(unique=True)
    password: str = Field(min_length=8, max_length=150)
    role: RoleEnum = Field(default = RoleEnum.GUEST)
    phone_number: str | None = Field(default = None, max_length=15)

class UserCreate(UserBase):
    pass

class User(UserBase, table = True):
    __tablename__ = "user"
    id: int | None  = Field(default=None, primary_key=True)
    reservations: list[Reservation] = Relationship(back_populates="user") #Relación que se crea con la tabla "reservations"
    notifications: list[Notification] = Relationship(back_populates="user") #Relación que se crea con la tabla "notifications"