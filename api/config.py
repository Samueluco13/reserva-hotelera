
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    #Database variables
    USER_DB: str
    PASSWORD_DB: str
    HOST_DB: str
    PORT_DB: int
    NAME_DB: str

    #Sending email variables
    SERVER_PORT: int
    EMAIL_USER: str
    APP_PASSWORD: str

    #JWT variables
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8"
    )

@lru_cache
def get_settings():
    return Settings()