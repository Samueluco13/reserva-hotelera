from enum import Enum

from pydantic import EmailStr
from sqlmodel import SQLModel, Field, Relationship

"""Modelo para las opciones del ENUM del rol de usuario"""
class RoleEnum(str, Enum):
    guest = "guest"
    staff = "staff"
    admin = "admin"

class UserBase(SQLModel):
    first_name: str = Field(max_length=30)
    last_name: str = Field(max_length=150)
    email: EmailStr = Field(unique=True)
    password: str = Field(min_length=8, max_length=150)
    role: RoleEnum = Field(default = RoleEnum.guest)
    phone_number: str | None = Field(default = None, max_length=15)

class UserCreate(UserBase):
    pass

"""
Modelo para actualizar los datos del usuario.
Se definen los atributos como opcionales para que no genere errores a la hora de solo cambiar un dato
"""
class UserUpdate(UserBase):
    first_name: str | None = None
    last_name: str | None = None
    email: EmailStr | None = None
    password: str | None = None
    role: RoleEnum | None = None

class User(UserBase, table = True):
    __tablename__ = "user"
    id: int | None  = Field(default=None, primary_key=True)
    reservations: list["Reservation"] = Relationship(back_populates="user") #Relación que se crea con la tabla "reservations"
    notifications: list["Notification"] = Relationship(back_populates="user") #Relación que se crea con la tabla "notifications"

#Se deben importar al final para la importación circular
from .reservation import Reservation
from .notification import Notification