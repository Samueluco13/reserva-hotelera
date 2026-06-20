from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()
def hash_password(password):
    return password_hash.hash(password)

def verify_hash(password, hash):
    return password_hash.verify(password, hash)
