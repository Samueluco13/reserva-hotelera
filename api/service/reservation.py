from pydantic import EmailStr

from api.config import get_settings

from api.models.reservation import ReservationCreate, ReservationUpdate, ReservationUpdateHolder, ReservationUpdateStatus, StatusEnum
from api.models.notification import NotificationCreate

from api.repositories.user import UserRepository
from api.repositories.room import RoomRepository
from api.repositories.reservation import ReservationRepository
from api.repositories.notification import NotificationRepository

from api.exceptions.not_found_exception import NotFoundReservation
from api.exceptions.date_range_exception import InvalidDateRangeOrder, UnavailableDateRange
from api.exceptions.same_status_exception import SameStatusReservation

from api.service.user import get_u_by_id, get_u_by_email
from api.service.room import get_r_by_number
from api.service.notification import create_noti
from api.service.google_calendar import create_event, delete_event, get_upcoming_events, update_event

from api.utils.formats.dates import date_format_string


settings = get_settings()

email_user = settings.EMAIL_USER

"""Funcion que ayuda a crear una reserva, se utiliza en la creacion por parte de staff y por parte del mismo usuario"""
def _validate_date_range_helper(room_number: int, checkin, checkout, repo: ReservationRepository):
    if checkin >= checkout:
        raise InvalidDateRangeOrder()

    reservations_list = repo.get_all_available_by_room(room_number)
    if not reservations_list:
        return
    for res in reservations_list:
        if checkin < res.checkout_date and checkout > res.checkin_date:
            raise UnavailableDateRange()

def _creation_helper(reservation_data, user_id, room_repo: RoomRepository, reservation_repo: ReservationRepository, notification_repo: NotificationRepository, user_repo: UserRepository):
    room = get_r_by_number(reservation_data.room_number, room_repo)
    
    _validate_date_range_helper(room.number, reservation_data.checkin_date, reservation_data.checkout_date, reservation_repo)

    reservation_info = ReservationCreate(
        checkin_date = reservation_data.checkin_date,
        checkout_date = reservation_data.checkout_date,
        room_number = room.number,
        user_id = user_id
    )

    checkin_string = date_format_string(reservation_data.checkin_date)

    res_info = f"""\
        Tu reserva ha sido creada exitosamente.
        Tu habitación: {room.number}
        Fecha y hora del check-in: {checkin_string}
        """

    notification_data = NotificationCreate(
        content = res_info,
        user_id = user_id
    )

    user = get_u_by_id(user_id, user_repo)
    
    reservation = reservation_repo.create(reservation_info)
    create_event(reservation_data.room_number, reservation_data.checkin_date, reservation_data.checkout_date, "America/Bogota", [email_user, user.email])
    create_noti(notification_data, notification_repo, user_repo,"Información de su reserva")
    return reservation

def _searching_helper(reservation_db):
    next_events = get_upcoming_events()

    for event in next_events:
        if event["summary"] == f"Reservation room {reservation_db.room_number}" and event["start"] == reservation_db.checkin_date:
            break
        found_event = event
    return found_event

def create_reservation_guest(reservation_data, room_repo: RoomRepository, reservation_repo: ReservationRepository, notification_repo: NotificationRepository, user_repo: UserRepository):
    reservation = _creation_helper(reservation_data, reservation_data.user_id, room_repo, reservation_repo, notification_repo, user_repo)
    return reservation

def create_reservation_staff(reservation_data, user_repo: UserRepository, room_repo: RoomRepository, reservation_repo: ReservationRepository, notification_repo: NotificationRepository):
    user = get_u_by_email(reservation_data.user_email, user_repo)
    reservation = _creation_helper(reservation_data, user.id, room_repo, reservation_repo, notification_repo, user_repo)
    return reservation

def get_res_by_id(reservation_id: int, repo: ReservationRepository):
    reservation = repo.get_by_id(reservation_id)
    if not reservation:
        raise NotFoundReservation(reservation_id)
    return reservation

def get_all_res(repo: ReservationRepository):
    reservations = repo.get_all()
    get_upcoming_events()
    return reservations

def get_all_res_by_user(user_id: int, repo: ReservationRepository):
    return repo.get_all_by_user(user_id)

def update_res(reservation_id: int, reservation_data: ReservationUpdate, reservation_repo: ReservationRepository, notification_repo: NotificationRepository, user_repo: UserRepository):
    get_u_by_id(reservation_data.user_id, user_repo)
    reservation_db = reservation_repo.get_by_id(reservation_id)
    if not reservation_db:
        raise NotFoundReservation(reservation_id)
    
    reservation = reservation_repo.update(reservation_db, reservation_data)

    checkin_string = date_format_string(reservation.checkin_date)
    checkout_string = date_format_string(reservation.checkout_date)

    update_info = f"""\
            Tu reserva ha sido actualizada la nueva información es:
            Tu fecha y hora del check-in: {checkin_string}
            Tu fecha y hora del check-out: {checkout_string}
            Tu habitación: {reservation.room_number}
            Estado de tu reserva: {reservation.status.value}
        """

    notification_data = NotificationCreate(
        content = update_info,
        user_id = reservation.user_id
    )

    start_time = None
    if reservation_data.checkin_date:
        start_time = reservation_data.checkin_date
        print("Nueva hora de llegada ", start_time)
        
    end_time = None
    if reservation_data.checkout_date:
        end_time = reservation_data.checkout_date
        
    summary = None
    if reservation_data.room_number:
        summary = reservation_data.room_number
    
    event_to_update = _searching_helper(reservation_db)

    update_event(event_to_update["id"], summary, start_time, end_time)

    create_noti(notification_data, notification_repo, user_repo, "Actualización de tu reserva")
    return reservation

def update_res_status(reservation_id: int, new_status: StatusEnum, reservation_repo: ReservationRepository, notification_repo: NotificationRepository, user_repo: UserRepository):
    reservation_db = reservation_repo.get_by_id(reservation_id)
    if not reservation_db:
        raise NotFoundReservation(reservation_id)
    if reservation_db.status.value == new_status.value:
        raise SameStatusReservation(reservation_id, new_status.value)
    match new_status:
        case StatusEnum.cancelled:
            subject = "Sobre su reserva"
            message = f"""\
                Tu reserva ha sido cancelada
            """

        case StatusEnum.completed:
            subject = "Gracias por tu estadía"
            message = f"""\
                Tu reserva ha finalizado. Esperamos que hayas disfrutado tu estancia y que hayas tenido una excelente experiencia con nosotros.
                ¡Esperamos recibirte nuevamente muy pronto!
            """
    event_to_delete = _searching_helper(reservation_db)
    delete_event(event_to_delete["id"])
    reservation_data = ReservationUpdateStatus(
        status=new_status
    )
    reservation = reservation_repo.update_status(reservation_db, reservation_data)

    notification_data = NotificationCreate(
        content = message,
        user_id = reservation.user_id
    )

    create_noti(notification_data, notification_repo, user_repo, subject)
    return reservation

def update_res_holder(reservation_id: int, new_email: EmailStr, reservation_repo: ReservationRepository, notification_repo: NotificationRepository, user_repo: UserRepository):
    reservation_db = reservation_repo.get_by_id(reservation_id)
    if not reservation_db:
        raise NotFoundReservation(reservation_id)
    
    old_holder = get_u_by_id(reservation_db.user_id, user_repo)
    new_holder = get_u_by_email(new_email, user_repo)

    reservation = reservation_repo.update_holder(reservation_db, new_holder.id)

    checkin_string = date_format_string(reservation.checkin_date)
    checkout_string = date_format_string(reservation.checkout_date)
    
    old_holder_notification = NotificationCreate(
        content = "Tu reserva ha cambiado de titular. Gracias por haber contado con nosotros",
        user_id = old_holder.id
    )
    create_noti(old_holder_notification, notification_repo, user_repo, "NUEVO TITULAR")
    
    new_holder_notification = NotificationCreate(
        content = f"""\
            Eres el nuevo tiutlar de una reserva, esta es tu información
            Tu fecha y hora del check-in: {checkin_string}
            Tu fecha y hora del check-out: {checkout_string}
            Tu habitación: {reservation_db.room_number}
            Estado de tu reserva: {reservation_db.status.value}
            """,
        user_id = new_holder.id
    )
    create_noti(new_holder_notification, notification_repo, user_repo, "NUEVO TITULAR")

    event_to_update = _searching_helper(reservation_db)

    update_event(event_to_update["id"], attendee = new_email)

    return reservation

def delete_res(reservation_id: int, reservation_repo: ReservationRepository, notification_repo: NotificationRepository):
    reservation_to_delete = reservation_repo.get_by_id(reservation_id)
    if not reservation_to_delete:
        raise NotFoundReservation(reservation_id)
    u_id = reservation_to_delete.user_id

    notification_data = NotificationCreate(
        content = f"""\
            Tu reserva ha sido eliminada
        """,
        user_id = u_id
    )

    event_to_delete = _searching_helper(reservation_to_delete)

    reservation_repo.delete(reservation_to_delete)
    delete_event(event_to_delete["id"])
    create_noti(notification_data, notification_repo)
    return {"message": "Reservation deleted successfully"}