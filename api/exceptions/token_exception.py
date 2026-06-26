from fastapi import Request
from fastapi.responses import JSONResponse


class UnauthorizedBase(Exception):
    status_code = 401
    def __init__(self, message):
        self.message = message
        super().__init__(message)


class InvalidCredentials(UnauthorizedBase):
    def __init__(self):
        super().__init__("Invalid credentials")


class InvalidToken(UnauthorizedBase):
    def __init__(self):
        super().__init__("Invalid or expired token")


async def unauthorized_handler(request: Request, unauthorized: UnauthorizedBase):
    return JSONResponse(
        content={"message": unauthorized.message},
        status_code=unauthorized.status_code
    )