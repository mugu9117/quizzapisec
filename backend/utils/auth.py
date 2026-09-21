from functools import wraps

from flask import g, jsonify
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required

from models import Admin, Student


def _subject():
    identity = get_jwt_identity()
    claims = get_jwt()
    role = claims.get("role")
    if not identity or not role or ":" not in identity:
        return None
    prefix, _, uid = identity.partition(":")
    if prefix != role:
        return None
    try:
        return {"role": role, "user_id": int(uid)}
    except (TypeError, ValueError):
        return None


def student_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        subject = _subject()
        if not subject or subject["role"] != "student":
            return jsonify({"error": "Invalid or missing student token"}), 401
        student = Student.query.get(subject["user_id"])
        if student is None:
            return jsonify({"error": "Student account not found"}), 401
        g.student = student
        return fn(*args, **kwargs)

    return wrapper


def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        subject = _subject()
        if not subject or subject["role"] != "admin":
            return jsonify({"error": "Admin access required"}), 403
        admin = Admin.query.get(subject["user_id"])
        if admin is None:
            return jsonify({"error": "Admin account not found"}), 401
        g.admin = admin
        return fn(*args, **kwargs)

    return wrapper