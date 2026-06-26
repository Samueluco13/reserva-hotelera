from sqlmodel import Session, select
from api.models.notification import Notification, NotificationCreate

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
        return self.session.get(Notification, notification_id)
    
    def get_all(self) -> list[Notification]:
        return self.session.exec(select(Notification)).all()
    
    def delete(self, notification_to_delete: Notification) -> bool:
        self.session.delete(notification_to_delete)
        self.session.commit()
        return True