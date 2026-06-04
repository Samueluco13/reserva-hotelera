import os
from fastapi import FastAPI
from .routers import user, reservation, room, room_type, notification

# Ensure repositories directory exists
_repos_dir = os.path.join(os.path.dirname(__file__), 'repositories')
os.makedirs(_repos_dir, exist_ok=True)

# Create __init__.py if it doesn't exist
_init_file = os.path.join(_repos_dir, '__init__.py')
if not os.path.exists(_init_file):
    with open(_init_file, 'w') as f:
        f.write('# Repository layer for data access operations\nfrom .user_repository import UserRepository\n\n__all__ = ["UserRepository"]\n')

# Create user_repository.py if it doesn't exist
_user_repo_file = os.path.join(_repos_dir, 'user_repository.py')
if not os.path.exists(_user_repo_file):
    with open(_user_repo_file, 'w') as f:
        f.write('''from sqlmodel import Session, select
from app.models.user import User, UserCreate, UserUpdate


class UserRepository:
    def __init__(self, session: Session):
        self.session = session

    def create(self, user: UserCreate) -> User:
        """Create a new user in the database"""
        dict_user = user.model_dump()
        db_user = User.model_validate(dict_user)
        self.session.add(db_user)
        self.session.commit()
        self.session.refresh(db_user)
        return db_user

    def get_by_id(self, user_id: int) -> User | None:
        """Get a user by their ID"""
        return self.session.get(User, user_id)

    def get_by_email(self, user_email: str) -> User | None:
        """Get a user by their email"""
        statement = select(User).where(User.email == user_email)
        return self.session.exec(statement).first()

    def get_all(self) -> list[User]:
        """Get all users from the database"""
        return self.session.exec(select(User)).all()

    def update(self, user_id: int, user: UserUpdate) -> User | None:
        """Update a user by their ID"""
        user_db = self.session.get(User, user_id)
        if not user_db:
            return None
        
        user_data_dict = user.model_dump(exclude_unset=True)
        user_db.sqlmodel_update(user_data_dict)
        self.session.add(user_db)
        self.session.commit()
        self.session.refresh(user_db)
        return user_db

    def delete(self, user_id: int) -> bool:
        """Delete a user by their ID. Returns True if deleted, False if not found"""
        user_to_delete = self.session.get(User, user_id)
        if not user_to_delete:
            return False
        
        self.session.delete(user_to_delete)
        self.session.commit()
        return True
''')

app = FastAPI()
app.include_router(user.router)
app.include_router(reservation.router)
app.include_router(room.router)
app.include_router(room_type.router)
app.include_router(notification.router)
