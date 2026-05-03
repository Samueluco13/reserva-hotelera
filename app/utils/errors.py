from fastapi import HTTPException, status
from sqlmodel import SQLModel

def not_found_error(type: list | SQLModel, obj: str):
    if type == list:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail = f"there is no {obj}s")
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail = f"{obj} not found")