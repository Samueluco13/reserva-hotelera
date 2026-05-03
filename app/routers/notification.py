from fastapi import APIRouter, status
from sqlmodel import select

from app.db import session
from ..models.notification import Notification, NotificationCreate

from ..utils.errors import not_found_error

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.post("", response_model=Notification, status_code=status.HTTP_201_CREATED)
async def create_notification(notification_data: NotificationCreate, session: session):
    notification_dict = notification_data.model_dump()
    notification = Notification.model_validate(notification_dict)
    session.add(notification)
    session.commit()
    session.refresh(notification)
    return notification

@router.get("/{notification_id}", response_model=Notification, status_code=status.HTTP_200_OK)
async def get_notification_by_id(notification_id: int, session: session):
    notification = session.get(Notification, notification_id)
    if not notification:
        not_found_error(Notification, "notification")
    return notification

@router.get("", response_model = list[Notification], status_code=status.HTTP_200_OK)
async def get_all_notifications(session: session):
    notifications = session.exec(select(Notification)).all()
    if not notifications:
        not_found_error(list, "notification")
    return notifications

@router.delete("/{notification_id}", status_code=status.HTTP_200_OK)
async def delete_notification_by_id(notification_id: int, session: session):
    notification = session.get(Notification, notification_id)
    if not notification:
        not_found_error(Notification, "notification")
    session.delete(notification)
    session.commit()
    session.refresh(notification)
    return {"message" : "Notification deleted successfully"}