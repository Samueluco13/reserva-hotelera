from sqlmodel import Session, select
from app.models.user import User, UserCreate, UserUpdate


class UserRepository:
    def __init__(self, session: Session):
        self.session = session

    def create(self, user: UserCreate) -> User:
        dict_user = user.model_dump()
        db_user = User.model_validate(dict_user)
        self.session.add(db_user)
        self.session.commit()
        self.session.refresh(db_user)
        return db_user

    def get_by_id(self, user_id: int) -> User | None:
        return self.session.get(User, user_id)

    def get_by_email(self, user_email: str) -> User | None:
        query = select(User).where(User.email == user_email)
        return self.session.exec(query).first()

    def get_all(self) -> list[User]:
        return self.session.exec(select(User)).all()

    def update(self, user_id: int, user: UserUpdate) -> User | None:
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
        user_to_delete = self.session.get(User, user_id)
        if not user_to_delete:
            return False
        
        self.session.delete(user_to_delete)
        self.session.commit()
        return True