from sqlmodel import Session, select
from app.models.reservation import Reservation, ReservationCreate, ReservationUpdate

class ReservationRepository:
    def __init__(self, session: Session):
        self.session = session
    
    def create(self, reservation_data: ReservationCreate) -> Reservation:
        dict_reservation = reservation_data.model_dump()
        reservation = Reservation.model_validate(dict_reservation)
        self.session.add(reservation)
        self.session.commit()
        self.session.refresh(reservation)
        return reservation

    def get_by_id(self, reservation_id: int) -> Reservation | None:
        return self.session.get(Reservation, reservation_id)
    
    def get_all(self) -> list[Reservation]:
        return self.session.exec(select(Reservation)).all()
    
    def delete(self, reservation_id: int) -> bool:
        reservation_to_delete = self.session.get(Reservation, reservation_id)
        if not reservation_to_delete:
            return False
        self.session.delete(reservation_to_delete)
        self.session.commit()
        return True
    
    def update(self, reservation_id: int, reservation: ReservationUpdate) -> Reservation | None:
        reservation_db = self.session.get(Reservation, reservation_id)
        if not reservation_db:
            return None

        reservation_data_dict = reservation.model_dump(exclude_unset=True)
        reservation_db.sqlmodel_update(reservation_data_dict)
        
        self.session.add(reservation_db)
        self.session.commit()
        self.session.refresh(reservation_db)
        return reservation_db