from fastapi import APIRouter, status

from ..models.notification import Notification, NotificationCreate

from app.utils.dependencies import notification_repo

from app.service.notification import create_noti, get_noti_by_id, get_all_noti, delete_noti

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.post("", response_model=Notification, status_code=status.HTTP_201_CREATED)
async def create_notification(notification_data: NotificationCreate, repo: notification_repo):
    return create_noti(notification_data, repo)

@router.get("/{notification_id}", response_model=Notification, status_code=status.HTTP_200_OK)
async def get_notification_by_id(notification_id: int, repo: notification_repo):
    return get_noti_by_id(notification_id, repo)

@router.get("", response_model = list[Notification], status_code=status.HTTP_200_OK)
async def get_all_notifications(repo: notification_repo):
    return get_all_noti(repo)

@router.delete("/{notification_id}", status_code=status.HTTP_200_OK)
async def delete_notification_by_id(notification_id: int, repo: notification_repo):
    return delete_noti(notification_id, repo)