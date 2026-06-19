from fastapi import Request
from fastapi.responses import JSONResponse

class AlreadyExistsBase(Exception):
    status_code = 409
    def __init__(self, message):
        self.message = message
        super().__init__(message)

class AlreadyExistsUserEmail(AlreadyExistsBase):
    def __init__(self, email):
        self.email = email
        super().__init__(f"User with email {email} already exists")

class AlreadyExistsRoomNumber(AlreadyExistsBase):
    def __init__(self, number):
        self.number = number
        super().__init__(f"Room with number {number} already exists")

class AlreadyExistsRoomTypeName(AlreadyExistsBase):
    def __init__(self, name):
        self.name = name
        super().__init__(f"Room type named {name} already exists")

def already_exists_handler(request: Request, already_exists: AlreadyExistsBase):
    return JSONResponse(
        content={"message": already_exists.message},
        status_code=already_exists.status_code
    )