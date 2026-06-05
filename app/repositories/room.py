from sqlmodel import Session, select
from app.models.room import Room, RoomCreate, RoomUpdate

class RoomRepository:
    def __init__(self, session: Session):
        self.session = session

    def create(self, room_data: RoomCreate) -> Room:
        room_dict = room_data.model_dump()
        room = Room.model_validate(room_dict)
        self.session.add(room)
        self.session.commit()
        self.session.refresh(room)
        return room
    
    def get_by_number(self, room_number: int) -> Room | None:
        return self.session.get(Room, room_number)
    
    def get_all(self) -> list[Room]:
        return self.session.exec(select(Room)).all()
    
    def delete(self, room_number: int) -> bool:
        room = self.session.get(Room, room_number)
        if not room:
            return False
        self.session.delete(room)
        self.session.commit()
        return True
    
    def update(self, room_number: int, room_data: RoomUpdate) -> Room | None:
        room_db = self.session.get(Room, room_number)
        if not room_db:
            return None
        
        room_data_dict = room_data.model_dump(exclude_unset = True)
        room_db.sqlmodel_update(room_data_dict)

        self.session.add(room_db)
        self.session.commit()
        self.session.refresh(room_db)
        return room_db