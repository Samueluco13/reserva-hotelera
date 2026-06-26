from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt

from api.config import get_settings

settings = get_settings()

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy() #Copia la información del usuario
    if expires_delta is None:
        expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    expire = datetime.now(timezone.utc) + expires_delta #El token expira un tiempo definido después de ser creado
    to_encode.update({"exp": expire}) #Le agrega un "atributo" al diccionadio de información que es la expiración del token
    encoded_jwt= jwt.encode(to_encode, settings.SECRET_KEY, settings.ALGORITHM) #Codifica el token
    return encoded_jwt

def verify_access_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]) #Decodifica el token
        return payload
    except JWTError:
        return None