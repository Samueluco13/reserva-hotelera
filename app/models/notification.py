from datetime import datetime

from pydantic import BaseModel

class NotificationBase(BaseModel):
    created_at: datetime
    content: str
    guest_id: int

class NotificationCreate(NotificationBase):
    pass

class Notification(NotificationBase):
    id: int | None = None