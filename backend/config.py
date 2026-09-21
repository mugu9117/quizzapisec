import os
from datetime import timedelta

from dotenv import load_dotenv

load_dotenv()


def _build_database_uri():
    user = os.getenv("DB_USER", "")
    password = os.getenv("DB_PASSWORD", "")
    host = os.getenv("DB_HOST", "localhost")
    port = os.getenv("DB_PORT", "3306")
    name = os.getenv("DB_NAME", "quiz_db")
    return f"mysql+pymysql://{user}:{password}@{host}:{port}/{name}?charset=utf8mb4"


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", SECRET_KEY)
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=8)
    JWT_TOKEN_LOCATION = ["headers"]

    SQLALCHEMY_DATABASE_URI = _build_database_uri()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True}

    ADMIN_PHONE = os.getenv("ADMIN_PHONE", "1234567890")
    ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "sec@123")

    QUIZ_DURATION_SECONDS = int(os.getenv("QUIZ_DURATION_SECONDS", "1800"))
    QUIZ_VIOLATION_LIMIT = int(os.getenv("QUIZ_VIOLATION_LIMIT", "3"))