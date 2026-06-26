from typing import Annotated

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer

from api.models.user import RoleEnum

from .jwt import verify_access_token

from api.exceptions.token_exception import InvalidToken
from api.exceptions.role_exception import RoleExceptionBase, SpecificRoleRequired

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    payload = verify_access_token(token)
    if not payload:
        raise InvalidToken()
    return payload

def require_role(*allowed: RoleEnum):
    """Devuelve una dependencia que valida JWT + rol."""
    allowed_values = {r.value for r in allowed}
    def _checker(token: str = Depends(oauth2_scheme)) -> dict:
        payload = get_current_user(token)
        if payload.get("role") not in allowed_values:
            if len(allowed) == 1:
                raise SpecificRoleRequired(allowed[0].value)
            raise RoleExceptionBase("Invalid role")
        return payload
    return _checker

admin_user = Annotated[dict, Depends(require_role(RoleEnum.admin))]
staff_user = Annotated[dict, Depends(require_role(RoleEnum.staff))]
guest_user = Annotated[dict, Depends(require_role(RoleEnum.guest))]

company_user = Annotated[dict, Depends(require_role(RoleEnum.admin, RoleEnum.staff))]