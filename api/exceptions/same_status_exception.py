from fastapi.requests import Request
from fastapi.responses import JSONResponse

class SameStatusBase(Exception):
    status_code = 409
    def __init__(self, message):
        self.message = message
        super().__init__(message)

class SameStatusReservation(SameStatusBase):
    def __init__(self, id, status):
        self.id = id
        self.status = status
        super().__init__(f"The reservation with id {id} is already {status}")

class SameStatusRoom(SameStatusBase):
    def __init__(self, number, status):
        self.number = number
        self.status = status
        super().__init__(f"The room with number {number} is already {status}")

def same_status_helper(request: Request, same_status: SameStatusBase):
    return JSONResponse(
        content={"message": same_status.message},
        status_code=same_status.status_code
    )