from flask import Blueprint, g, jsonify, request

from extensions import db
from models import Student, Violation
from utils.auth import admin_required

admin_bp = Blueprint("admin", __name__)


@admin_bp.get("/students")
@admin_required
def list_students():
    students = Student.query.order_by(Student.name.asc()).all()
    return jsonify({"students": [s.to_admin_dict() for s in students]})


@admin_bp.delete("/students")
@admin_required
def delete_students():
    data = request.get_json(silent=True) or {}
    student_ids = data.get("student_ids")

    if isinstance(student_ids, list) and student_ids:
        ids = [i for i in student_ids if isinstance(i, int)]
        if not ids:
            return jsonify({"error": "No valid student ids provided"}), 400
        deleted = 0
        for sid in ids:
            student = db.session.get(Student, sid)
            if student is None:
                continue
            student.violation_log.delete()
            db.session.delete(student)
            deleted += 1
        db.session.commit()
        return jsonify({"deleted": deleted, "message": f"{deleted} student(s) permanently deleted"})

    if not data.get("confirm"):
        return jsonify({"error": "Explicit confirmation is required to delete student data"}), 400

    Violation.query.delete(synchronize_session=False)
    student_count = Student.query.count()
    Student.query.delete(synchronize_session=False)
    db.session.commit()
    return jsonify({"deleted": student_count, "message": "Student data has been permanently deleted"})