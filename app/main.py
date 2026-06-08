from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from .routers import user, reservation, room, room_type, notification

app = FastAPI()
app.include_router(user.router)
app.include_router(reservation.router)
app.include_router(room.router)
app.include_router(room_type.router)
app.include_router(notification.router)

@app.middleware("http")
async def probando(request: Request, call_next):
    response = await call_next(request)
    if response.status_code == 404:
        return JSONResponse(status_code= 404, content={
            "message": "Resource not found"
        })
    return response