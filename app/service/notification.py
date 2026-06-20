from app.models.notification import NotificationCreate
from app.repositories.notification import NotificationRepository
from app.repositories.user import UserRepository

from app.exceptions.not_found_exception import NotFoundNotification

from app.service.user import get_u_by_id

from app.utils.email_sending import send_email

def create_noti(notification_data: NotificationCreate, repo: NotificationRepository, user_repo: UserRepository, subject: str):
    user = get_u_by_id(notification_data.user_id, user_repo)

    notification = repo.create(notification_data)
    send_email(subject, notification_data.content, user.email)
    return notification

def get_noti_by_id(notification_id: int, repo: NotificationRepository):
    notification = repo.get_by_id(notification_id)
    if not notification:
        raise NotFoundNotification(notification_id)
    return notification

def get_all_noti(repo: NotificationRepository):
    notifications = repo.get_all()
    return notifications

def delete_noti(notification_id: int, repo: NotificationRepository):
    notification_to_delete = repo.get_by_id(notification_id)
    if not notification_to_delete:
        raise NotFoundNotification(notification_id)
    deleted = repo.delete(notification_to_delete)
    if not deleted:
        False
    return {"message" : "Notification deleted successfully"}