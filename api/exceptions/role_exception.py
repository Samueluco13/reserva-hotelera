from fastapi import Request
from fastapi.responses import JSONResponse

class RoleExceptionBase(Exception):
    status_code = 403
    def __init__(self, message):
        self.message = message
        super().__init__(message)

class SpecificRoleRequired(RoleExceptionBase):
    def __init__(self, role):
        self.role = role
        super().__init__(f"{role} role required")

async def role_exception_handler(request: Request, unauthorized: RoleExceptionBase):
    return JSONResponse(
        content={"message": unauthorized.message},
        status_code=unauthorized.status_code
    )