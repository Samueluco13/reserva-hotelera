from api.models.user import User

from api.repositories.user import UserRepository

from api.utils.security.hash import hash_password, verify_hash
from api.utils.security.jwt import create_access_token

from api.exceptions.token_exception import InvalidCredentials


def register_user(user_data, repo: UserRepository) -> User:
    user_hashed = User(
        **user_data.model_dump(exclude={"password"}),
        password=hash_password(user_data.password)
    )
    user = repo.create(user_hashed)
    return user


def _authenticate_user_helper(user_email: str, password: str, repo: UserRepository) -> User:
    user = repo.get_by_email(user_email)
    if not user or not verify_hash(password, user.password):
        raise InvalidCredentials()
    return user


def login_user(user_email: str, password: str, repo: UserRepository) -> dict:
    user = _authenticate_user_helper(user_email, password, repo)
    token = create_access_token({
        "sub": user.email,
        "id": user.id,
        "role": user.role.value,
    })
    return {"access_token": token, "token_type": "bearer"}