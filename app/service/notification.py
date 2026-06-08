from app.models.notification import Notification, NotificationCreate
from app.repositories.notification import NotificationRepository
from app.utils.errors import not_found_error

def create_noti(notification_data: NotificationCreate, repo: NotificationRepository):
    notification = repo.create(notification_data)
    return notification

def get_noti_by_id(notification_id: int, repo: NotificationRepository):
    notification = repo.get_by_id(notification_id)
    if not notification:
        not_found_error(Notification, "notification")
    return notification

def get_all_noti(repo: NotificationRepository):
    notifications = repo.get_all()
    if not notifications:
        not_found_error(list, "notification")
    return notifications

def delete_noti(notification_id: int, repo: NotificationRepository):
    notification_to_delete = repo.get_by_id(notification_id)
    deleted = repo.delete(notification_to_delete)
    if not deleted:
        False
    return {"message" : "Notification deleted successfully"}