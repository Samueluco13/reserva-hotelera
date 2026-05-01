import os
from dotenv import load_dotenv

from typing import Annotated
from fastapi import Depends
from sqlmodel import create_engine, Session

"""Se cargan las variables de entorno
para crear el motor de la base de datos"""
load_dotenv()
db_user = os.getenv("USER_DB")
db_password = os.getenv("PASSWORD_DB")
db_host = os.getenv("HOST_DB")
db_port = os.getenv("PORT_DB")
db_name = os.getenv("NAME_DB")

mysql_url = f"mysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
engine =create_engine(mysql_url)

"""Función para obtener la sesión de la base de datos"""
def get_session():
    with Session(engine) as session:
        yield session

session = Annotated[Session, Depends(get_session)]