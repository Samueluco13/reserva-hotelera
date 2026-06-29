from api.models.notification import NotificationCreate
from api.repositories.notification import NotificationRepository
from api.repositories.user import UserRepository

from api.exceptions.not_found_exception import NotFoundNotification

from api.service.user import get_u_by_id

from api.utils.messaging.email import send_email

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

def get_all_noti_by_user(user_id: int, repo: NotificationRepository):
    """Lista las notificaciones de un usuario específico."""
    return repo.get_all_by_user(user_id)

def delete_noti(notification_id: int, repo: NotificationRepository):
    notification_to_delete = repo.get_by_id(notification_id)
    if not notification_to_delete:
        raise NotFoundNotification(notification_id)
    deleted = repo.delete(notification_to_delete)
    if not deleted:
        False
    return {"message" : "Notification deleted successfully"}