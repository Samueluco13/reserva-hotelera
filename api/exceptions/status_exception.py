from fastapi.requests import Request
from fastapi.responses import JSONResponse

class StatusBase(Exception):
    status_code = 409
    def __init__(self, message):
        self.message = message
        super().__init__(message)

class SameStatusReservation(StatusBase):
    def __init__(self, id, status):
        self.id = id
        self.status = status
        super().__init__(f"The reservation with id {id} is already {status}")

class SameStatusRoom(StatusBase):
    def __init__(self, number, status):
        self.number = number
        self.status = status
        super().__init__(f"The room with number {number} is already {status}")

class InmutableStatusReservation(StatusBase):
    def __init__(self, status):
        self.status = status
        super().__init__(f"An {status} reservation cannot modify its status")

def status_exception_helper(request: Request, same_status: StatusBase):
    return JSONResponse(
        content={"message": same_status.message},
        status_code=same_status.status_code
    )