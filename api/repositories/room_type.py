from sqlmodel import Session, select
from api.models.room_type import RoomType, RoomTypeCreate, RoomTypeUpdate

from api.exceptions.already_exists_exception import AlreadyExistsRoomTypeName

from sqlalchemy.exc import IntegrityError

class RoomTypeRepository:
    def __init__ (self, session: Session):
        self.session = session

    def create(self, room_type_data: RoomTypeCreate) -> RoomType:
        dict_room_type = room_type_data.model_dump()
        room_type = RoomType.model_validate(dict_room_type)
        self.session.add(room_type)
        try:
            self.session.commit()
        except IntegrityError:
            self.session.rollback()
            raise AlreadyExistsRoomTypeName(room_type_data.name)
        self.session.refresh(room_type)
        return room_type
    
    def get_by_id(self, room_type_id: int) -> RoomType | None:
        return self.session.get(RoomType, room_type_id)
    
    def get_by_name(self, name: str) -> RoomType | None:
        query = select(RoomType).where(RoomType.name == name)
        return self.session.exec(query).first()

    def get_all(self) -> list[RoomType]:
        return self.session.exec(select(RoomType)).all()
    
    def update(self, room_type_db: RoomType, room_type_data: RoomTypeUpdate) -> RoomType | None:
        room_type_db.sqlmodel_update(room_type_data)

        self.session.add(room_type_db)
        try:
            self.session.commit()
        except IntegrityError:
            self.session.rollback()
            raise AlreadyExistsRoomTypeName(room_type_data.name)
        self.session.refresh(room_type_db)
        return room_type_db

    def delete(self, room_type: RoomType) -> bool:
        self.session.delete(room_type)
        self.session.commit()
        return True
    