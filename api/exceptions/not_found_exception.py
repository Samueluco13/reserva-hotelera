from fastapi import Request
from fastapi.responses import JSONResponse

class NotFoundBase(Exception):
    status_code = 404
    def __init__(self, message):
        self.message = message
        super().__init__(message)

class NotFoundUserByEmail(NotFoundBase):
    def __init__(self, email):
        self.email = email
        super().__init__(f"User with email {email} not found")

class NotFoundUserById(NotFoundBase):
    def __init__(self, id):
        self.id = id
        super().__init__(f"User with id {id} not found")

class NotFoundRoom(NotFoundBase):
    def __init__(self, room_number):
        self.room_number = room_number
        super().__init__(f"Room with number {room_number} not found")

class NotFoundReservation(NotFoundBase):
    def __init__(self, id):
        self.id = id
        super().__init__(f"Reservation with id {id} not found")

class NotFoundRoomTypeById(NotFoundBase):
    def __init__(self, id):
        self.id = id
        super().__init__(f"Room type with id {id} not found")

class NotFoundRoomTypeByName(NotFoundBase):
    def __init__(self, name):
        self.name = name
        super().__init__(f"Room type named '{name}' not found")

class NotFoundNotification(NotFoundBase):
    def __init__(self, id):
        self.id = id
        super().__init__(f"Notification with id {id} not found")

async def not_found_handler(request: Request, not_found: NotFoundBase):
    return JSONResponse(
        content={"message": not_found.message},
        status_code=not_found.status_code
        )