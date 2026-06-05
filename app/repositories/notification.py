from sqlmodel import Session, select
from app.models.notification import Notification, NotificationCreate

class NotificationRepository:
    def __init__(self, session: Session):
        self.session = session

    def create(self, notification_data: NotificationCreate) -> Notification:
        notification_dict = notification_data.model_dump()
        notification = Notification.model_validate(notification_dict)
        self.session.add(notification)
        self.session.commit()
        self.session.refresh(notification)
        return notification

    def get_by_id(self, notification_id: int) -> Notification | None:
        notification = self.session.get(Notification, notification_id)
        if not notification:
            return None
        return notification
    
    def get_all(self) -> list[Notification]:
        return self.session.exec(select(Notification)).all()
    
    def delete(self, notification_id: int) -> bool:
        notification = self.session.get(Notification, notification_id)
        if not notification:
            return False
        self.session.delete(notification)
        self.session.commit()
        return True