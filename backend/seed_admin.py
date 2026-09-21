import os

from dotenv import load_dotenv

load_dotenv()


def seed_admin(app):
    """Create the admin account from environment variables if it does not exist."""
    from extensions import db
    from models import Admin

    phone = app.config["ADMIN_PHONE"]
    password = app.config["ADMIN_PASSWORD"]

    existing = Admin.query.filter_by(phone_number=phone).first()
    if existing is None:
        admin = Admin(name="Quiz Administrator", phone_number=phone)
        admin.set_password(password)
        db.session.add(admin)
        db.session.commit()
        print(f"Admin seeded with phone {phone}")
    else:
        print("Admin already exists.")