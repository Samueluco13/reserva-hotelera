from fastapi import FastAPI
from .routers import user, reservation, room, room_type, notification

app = FastAPI()
app.include_router(user.router)
app.include_router(reservation.router)
app.include_router(room.router)
app.include_router(room_type.router)
app.include_router(notification.router)