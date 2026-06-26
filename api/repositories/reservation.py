from sqlmodel import Session, select
from api.models.reservation import Reservation, ReservationCreate, ReservationUpdate, StatusEnum

class ReservationRepository:
    def __init__(self, session: Session):
        self.session = session
    
    def create(self, reservation_data: ReservationCreate) -> Reservation:
        reservation_dict = reservation_data.model_dump()
        reservation = Reservation.model_validate(reservation_dict)
        self.session.add(reservation)
        self.session.commit()
        self.session.refresh(reservation)
        return reservation

    def get_by_id(self, reservation_id: int) -> Reservation | None:
        return self.session.get(Reservation, reservation_id)
    
    def get_all(self) -> list[Reservation]:
        return self.session.exec(select(Reservation)).all()
    
    def get_all_available_by_room(self, room_number: int) -> list[Reservation]:
        return self.session.exec(select(Reservation).where(
            Reservation.room_number == room_number,
            Reservation.status != StatusEnum.cancelled
            )).all()
    
    def update(self, reservation_db: Reservation, reservation_data: ReservationUpdate) -> Reservation | None:
        reservation_data_dict = reservation_data.model_dump(exclude_unset=True)
        reservation_db.sqlmodel_update(reservation_data_dict)
        
        self.session.add(reservation_db)
        self.session.commit()
        self.session.refresh(reservation_db)
        return reservation_db
    
    def delete(self, reservation_to_delete: Reservation) -> bool:
        if not reservation_to_delete:
            return False
        self.session.delete(reservation_to_delete)
        self.session.commit()
        return True
    