from app.repositories.user import UserRepository

from app.exceptions.not_found_exception import NotFoundUserById, NotFoundUserByEmail

def create_u(user_data, repo: UserRepository):
    user = repo.create(user_data)
    return user

def get_u_by_id(user_id: int, repo: UserRepository):
    user = repo.get_by_id(user_id)
    if not user:
        raise NotFoundUserById(user_id)
    return user

def get_u_by_email(user_email: str, repo: UserRepository):
    user = repo.get_by_email(user_email)
    if not user:
        raise NotFoundUserByEmail(user_email)
    return user

def get_all_u(repo: UserRepository):
    users = repo.get_all()
    return users

def update_u(user_id: int, user_data, repo: UserRepository):
    user_db = repo.get_by_id(user_id)
    if not user_db:
        raise NotFoundUserById(user_id)
    user = repo.update(user_db, user_data)
    return user

def delete_u(user_id: int, repo: UserRepository):
    user_to_delete = repo.get_by_id(user_id)
    if not user_to_delete:
        raise NotFoundUserById(user_id)
    repo.delete(user_to_delete)
    return {"message": "User deleted successfully"}