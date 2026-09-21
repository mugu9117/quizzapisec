import secrets


def generate_secret_key(length=48):
    return secrets.token_hex(length)


def generate_verification_token():
    return secrets.token_urlsafe(32)