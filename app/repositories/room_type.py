from sqlmodel import Session, select
from app.models.room import RoomType, RoomTypeCreate, RoomTypeUpdate

class RoomTypeRepository:
    def __init__ (self, session: Session):
        self.session = session

    def create(self, room_type_data: RoomTypeCreate) -> RoomType:
        dict_room_type = room_type_data.model_dump()
        room_type = RoomType.model_validate(dict_room_type)
        self.session.add(room_type)
        self.session.commit()
        self.session.refresh(room_type)
        return room_type
    
    def get_by_id(self, room_type_id: int) -> RoomType | None:
        room_type = self.session.get(RoomType, room_type_id)
        if not room_type:
            return None
        return room_type

    def get_all(self) -> list[RoomType]:
        return self.session.exec(select(RoomType)).all()

    def delete(self, room_type_id: int) -> bool:
        room_type = self.session.get(RoomType, room_type_id)
        if not room_type:
            return False
        self.session.delete(room_type)
        self.session.commit()
        return True
    
    def update(self, room_type_id: int, room_type_data: RoomTypeUpdate) -> RoomType | None:
        room_type_db = self.session.get(RoomType, room_type_id)
        if not room_type_db:
            return None
        
        room_type_dict = room_type_data.model_dump(exclude_unset=True)
        room_type_db.sqlmodel_update(room_type_dict)

        self.session.add(room_type_db)
        self.session.commit()
        self.session.refresh(room_type_db)
        return room_type_db