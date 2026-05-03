from datetime import datetime

from sqlmodel import SQLModel, Field, Relationship

class NotificationBase(SQLModel):
    created_at: datetime = Field(default_factory=datetime.now())
    content: str
    user_id: int = Field(foreign_key="user.id") #Llave foranea hacia la tabla "user"

class NotificationCreate(NotificationBase):
    pass

class Notification(NotificationBase, table=True):
    __tablename__ = "notification"
    id: int | None = Field(default=None, primary_key=True)
    user: "User" = Relationship(back_populates="notifications") #Rleación que se crea con la tabla "user"

#Se debe importar al final para la importación circular
from .user import User