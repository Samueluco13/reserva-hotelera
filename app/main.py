from fastapi import FastAPI
from .routers import user, reservation, room, room_type, notification

from .exceptions.not_found_exception import NotFoundBase, not_found_handler
from .exceptions.already_exists_exception import AlreadyExistsBase, already_exists_handler
from .exceptions.date_range_exception import DateRangeBase, date_range_handler

app = FastAPI()
app.include_router(user.router)
app.include_router(reservation.router)
app.include_router(room.router)
app.include_router(room_type.router)
app.include_router(notification.router)

app.add_exception_handler(NotFoundBase, not_found_handler)
app.add_exception_handler(AlreadyExistsBase, already_exists_handler)
app.add_exception_handler(DateRangeBase, date_range_handler)