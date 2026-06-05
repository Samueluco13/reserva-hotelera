from fastapi import APIRouter, Depends, status

from app.db import session
from ..models.notification import Notification, NotificationCreate

from ..utils.errors import not_found_error

from app.repositories.notification import NotificationRepository

router = APIRouter(prefix="/notifications", tags=["notifications"])

def get_notification_repository(session: session):
    return NotificationRepository(session)

@router.post("", response_model=Notification, status_code=status.HTTP_201_CREATED)
async def create_notification(notification_data: NotificationCreate, repo: NotificationRepository = Depends(get_notification_repository)):
    notification = repo.create(notification_data)
    return notification

@router.get("/{notification_id}", response_model=Notification, status_code=status.HTTP_200_OK)
async def get_notification_by_id(notification_id: int, repo: NotificationRepository = Depends(get_notification_repository)):
    notification = repo.get_by_id(notification_id)
    if not notification:
        not_found_error(Notification, "notification")
    return notification

@router.get("", response_model = list[Notification], status_code=status.HTTP_200_OK)
async def get_all_notifications(repo: NotificationRepository = Depends(get_notification_repository)):
    notifications = repo.get_all()
    if not notifications:
        not_found_error(list, "notification")
    return notifications

@router.delete("/{notification_id}", status_code=status.HTTP_200_OK)
async def delete_notification_by_id(notification_id: int, repo: NotificationRepository = Depends(get_notification_repository)):
    deleted = repo.delete(notification_id)
    if not deleted:
        not_found_error(Notification, "notification")
    return {"message" : "Notification deleted successfully"}