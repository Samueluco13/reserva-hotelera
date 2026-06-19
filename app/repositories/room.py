from sqlmodel import Session, select
from app.models.room import Room, RoomCreate, RoomUpdate

from app.exceptions.already_exists_exception import AlreadyExistsRoomNumber

from sqlalchemy.exc import IntegrityError

class RoomRepository:
    def __init__(self, session: Session):
        self.session = session

    def create(self, room_data: RoomCreate) -> Room:
        room_dict = room_data.model_dump()
        room = Room.model_validate(room_dict)
        self.session.add(room)
        try:
            self.session.commit()
        except IntegrityError:
            raise AlreadyExistsRoomNumber(room_data.number)
        self.session.refresh(room)
        return room
    
    def get_by_number(self, room_number: int) -> Room | None:
        return self.session.get(Room, room_number)
    
    def get_all(self) -> list[Room]:
        return self.session.exec(select(Room)).all()
    
    def update(self, room_db: Room, room_data: RoomUpdate) -> Room | None:
        room_data_dict = room_data.model_dump(exclude_unset=True)
        room_db.sqlmodel_update(room_data_dict)

        self.session.add(room_db)
        try:
            self.session.commit()
        except IntegrityError:
            self.session.rollback()
            raise AlreadyExistsRoomNumber(room_data.number)
        self.session.refresh(room_db)
        return room_db
    
    def delete(self, room_db: Room) -> bool:
        self.session.delete(room_db)
        self.session.commit()
        return True