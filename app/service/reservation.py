from app.models.user import User
from app.models.room import Room

from app.repositories.user import UserRepository
from app.repositories.room import RoomRepository
from app.repositories.reservation import ReservationRepository
from app.repositories.notification import NotificationRepository

from app.models.reservation import Reservation, ReservationCreate, ReservationUpdate, StatusEnum
from app.models.notification import NotificationCreate

from app.utils.errors import not_found_error
from app.utils.formats import date_format_string
from app.utils.email_sending import send_email

"""Funcion que ayuda a crear una reserva, se utiliza en la creacion por parte de staff y por parte del mismo usuario"""
def _creation_helper(reservation_data, user_id, room_repo: RoomRepository, reservation_repo: ReservationRepository, notification_repo: NotificationRepository, user_repo: UserRepository):
    room = room_repo.get_by_number(reservation_data.room_number)
    if not room:
        not_found_error(Room, "room")

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
        Fecha y hora del checkin: {checkin_string}
        """

    notification_data = NotificationCreate(
        content = res_info,
        user_id = user_id
    )

    user = user_repo.get_by_id(user_id)

    reservation = reservation_repo.create(reservation_info)
    notification_repo.create(notification_data)
    send_email("Información de su reserva", res_info, user.email)
    return reservation

def create_reservation_user(reservation_data, room_repo: RoomRepository, reservation_repo: ReservationRepository, notification_repo: NotificationRepository, user_repo: UserRepository):
    reservation = _creation_helper(reservation_data, reservation_data.user_id, room_repo, reservation_repo, notification_repo, user_repo)
    return reservation

def create_reservation_staff(reservation_data, user_repo: UserRepository, room_repo: RoomRepository, reservation_repo: ReservationRepository, notification_repo: NotificationRepository):
    user = user_repo.get_by_email(reservation_data.user_email)
    if not user:
        not_found_error(User, "user")
    reservation = _creation_helper(reservation_data, user.id, room_repo, reservation_repo, notification_repo, user_repo)
    return reservation

def get_res_by_id(reservation_id: int, repo: ReservationRepository):
    reservation = repo.get_by_id(reservation_id)
    if not reservation:
        not_found_error(Reservation, "reservation")
    return reservation

def get_all_res(repo: ReservationRepository):
    reservations = repo.get_all()
    if not reservations:
        not_found_error(list, "reservation")
    return reservations

def update_res(reservation_id: int, reservation_data, reservation_repo: ReservationRepository, notification_repo: NotificationRepository):
    reservation_db = reservation_repo.get_by_id(reservation_id)
    if not reservation_db:
        not_found_error(Reservation, "reservation")

    reservation = reservation_repo.update(reservation_db, reservation_data)

    checkin_string = date_format_string(reservation.checkin_date)
    checkout_string = date_format_string(reservation.checkout_date)

    notification_data = NotificationCreate(
        content = f"""\
            Tu reserva ha sido actualizada la nueva información es:
            Tu fecha y hora del check-in: {checkin_string}
            Tu fecha y hora del check-out: {checkout_string}
            Tu habitación: {reservation.room_number}
            Estado de tu reserva: {reservation.status.value}
        """,
        user_id = reservation.user_id
    )

    notification_repo.create(notification_data)
    return reservation

def update_res_status(reservation_id: int, new_status: StatusEnum, reservation_repo: ReservationRepository, notification_repo: NotificationRepository):
    reservation = reservation_repo.get_by_id(reservation_id)
    if not reservation:
        not_found_error(Reservation, "reservation")
    match new_status:
        case StatusEnum.cancelled:
            message = f"""\
                Tu reserva ha sido cancelada
            """
        case StatusEnum.completed:
            message = f"""\
            Gracias por tu estadía
                Tu reserva ha finalizado. Esperamos que hayas disfrutado tu estancia y que hayas tenido una excelente experiencia con nosotros.
                ¡Esperamos recibirte nuevamente muy pronto!
            """
    reservation_data = ReservationUpdate(
        status=new_status
    )
    reservation_repo.update(reservation, reservation_data)

    notification_data = NotificationCreate(
        content = message,
        user_id = reservation.user_id
    )

    notification_repo.create(notification_data)
    return reservation

def delete_res(reservation_id: int, reservation_repo: ReservationRepository, notification_repo: NotificationRepository):
    reservation = reservation_repo.get_by_id(reservation_id)
    if not reservation:
        not_found_error(Reservation, "reservation")
    u_id = reservation.user_id

    notification_data = NotificationCreate(
        content = f"""\
            Tu reserva ha sido eliminada
        """,
        user_id = u_id
    )

    reservation_to_delete = reservation_repo.get_by_id(reservation_id)
    reservation_repo.delete(reservation_to_delete)
    notification_repo.create(notification_data)
    return {"message": "Reservation deleted successfully"}