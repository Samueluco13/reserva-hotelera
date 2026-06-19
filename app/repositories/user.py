from sqlmodel import Session, select
from app.models.user import User, UserCreate, UserUpdate

from app.exceptions.already_exists_exception import AlreadyExistsUserEmail

from sqlalchemy.exc import IntegrityError


class UserRepository:
    def __init__(self, session: Session):
        self.session = session

    def create(self, user: UserCreate) -> User:
        dict_user = user.model_dump()
        db_user = User.model_validate(dict_user)
        self.session.add(db_user)
        try:
            self.session.commit()
        except IntegrityError:
            self.session.rollback() #Para que salga del estado de error
            raise AlreadyExistsUserEmail(user.email)
        self.session.refresh(db_user)
        return db_user

    def get_by_id(self, user_id: int) -> User | None:
        return self.session.get(User, user_id)

    def get_by_email(self, user_email: str) -> User | None:
        query = select(User).where(User.email == user_email)
        return self.session.exec(query).first()

    def get_all(self) -> list[User]:
        return self.session.exec(select(User)).all()

    def update(self, user_db: User, user_data: UserUpdate) -> User | None: 
        user_data_dict = user_data.model_dump(exclude_unset=True)
        user_db.sqlmodel_update(user_data_dict)
        self.session.add(user_db)
        try:
            self.session.commit()
        except IntegrityError:
            self.session.rollback() #Para que salga del estado de error
            raise AlreadyExistsUserEmail(user_data.email)
        self.session.refresh(user_db)
        return user_db

    def delete(self, user_to_delete: User) -> bool:        
        self.session.delete(user_to_delete)
        self.session.commit()
        return True