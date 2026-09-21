from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token

from extensions import db
from models import Admin, Student
from utils.quiz import is_valid_email, is_valid_phone, normalize_phone

auth_bp = Blueprint("auth", __name__)


def _student_token(student):
    return create_access_token(
        identity=f"student:{student.id}", additional_claims={"role": "student"}
    )


def _admin_token(admin):
    return create_access_token(
        identity=f"admin:{admin.id}", additional_claims={"role": "admin"}
    )


@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}

    name = (data.get("name") or "").strip()
    college_name = (data.get("college_name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    phone_number = normalize_phone(data.get("phone_number"))
    password = data.get("password") or ""
    confirm_password = data.get("confirm_password") or ""

    if not name:
        return jsonify({"error": "Please enter your full name", "field": "name"}), 400
    if not college_name:
        return jsonify({"error": "Please enter your college name", "field": "college_name"}), 400
    if not is_valid_email(email):
        return jsonify({"error": "Please enter a valid email address", "field": "email"}), 400
    if not is_valid_phone(phone_number):
        return (
            jsonify(
                {
                    "error": "Please enter a valid 10-digit phone number",
                    "field": "phone_number",
                }
            ),
            400,
        )
    if len(password) < 6:
        return (
            jsonify({"error": "Password must be at least 6 characters", "field": "password"}),
            400,
        )
    if password != confirm_password:
        return (
            jsonify({"error": "Passwords do not match", "field": "confirm_password"}),
            400,
        )

    existing = Student.query.filter_by(phone_number=phone_number).first()
    if existing is not None:
        return (
            jsonify({"error": "A student with this phone number is already registered", "field": "phone_number"}),
            409,
        )

    student = Student(
        name=name,
        college_name=college_name,
        email=email,
        phone_number=phone_number,
    )
    student.set_password(password)
    db.session.add(student)
    db.session.commit()

    return jsonify({"message": "Registration successful", "student": student.to_public_dict()}), 201


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    phone_number = normalize_phone(data.get("phone_number"))
    password = data.get("password") or ""

    if not is_valid_phone(phone_number):
        return jsonify({"error": "Please enter a valid phone number"}), 400

    student = Student.query.filter_by(phone_number=phone_number).first()
    if student is None or not student.check_password(password):
        return jsonify({"error": "Invalid phone number or password"}), 401

    return jsonify(
        {
            "token": _student_token(student),
            "student": student.to_public_dict(),
        }
    )


@auth_bp.post("/admin-login")
def admin_login():
    data = request.get_json(silent=True) or {}
    phone_number = data.get("phone_number") or ""
    password = data.get("password") or ""

    admin = Admin.query.filter_by(phone_number=phone_number).first()
    if admin is None or not admin.check_password(password):
        return jsonify({"error": "Invalid admin credentials"}), 401

    return jsonify({"token": _admin_token(admin), "admin": admin.to_dict()})