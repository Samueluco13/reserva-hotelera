from app.db import session

from typing import Annotated
from fastapi import Depends

from app.repositories.user import UserRepository
from app.repositories.room import RoomRepository
from app.repositories.room_type import RoomTypeRepository
from app.repositories.reservation import ReservationRepository
from app.repositories.notification import NotificationRepository

def get_user_repository(session: session) -> UserRepository:
    return UserRepository(session)
user_repo = Annotated[UserRepository, Depends(get_user_repository)]

def get_room_repository(session: session) -> RoomRepository:
    return RoomRepository(session)
room_repo = Annotated[RoomRepository, Depends(get_room_repository)]

def get_room_type_repository(session: session) -> RoomTypeRepository:
    return RoomTypeRepository(session)
room_type_repo = Annotated[RoomTypeRepository, Depends(get_room_type_repository)]

def get_reservation_repository(session: session) -> ReservationRepository:
    return ReservationRepository(session)
reservation_repo = Annotated[ReservationRepository, Depends(get_reservation_repository)]

def get_notification_repository(session: session) -> NotificationRepository:
    return NotificationRepository(session)
notification_repo = Annotated[NotificationRepository, Depends(get_notification_repository)]