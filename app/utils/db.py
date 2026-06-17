from typing import Annotated
from fastapi import Depends
from sqlmodel import create_engine, Session

from app.config import get_settings

"""Se cargan las variables de entorno para crear el motor de la base de datos"""
settings = get_settings()

db_user = settings.USER_DB
db_password = settings.PASSWORD_DB
db_host = settings.HOST_DB
db_port = settings.PORT_DB
db_name = settings.NAME_DB

mysql_url = f"mysql+mysqldb://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
engine = create_engine(mysql_url)

"""Función para obtener la sesión de la base de datos"""
def get_session():
    with Session(engine) as session:
        yield session

session = Annotated[Session, Depends(get_session)]