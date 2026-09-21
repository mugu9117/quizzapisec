from datetime import datetime

from werkzeug.security import check_password_hash, generate_password_hash

from extensions import db


class Student(db.Model):
    __tablename__ = "students"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    college_name = db.Column(db.String(160), nullable=False)
    email = db.Column(db.String(160), nullable=False)
    phone_number = db.Column(db.String(20), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    quiz_started_at = db.Column(db.DateTime, nullable=True)
    quiz_submitted_at = db.Column(db.DateTime, nullable=True)
    score = db.Column(db.Integer, nullable=True)
    completed_time = db.Column(db.Integer, nullable=True)
    violation_count = db.Column(db.Integer, nullable=False, default=0)

    def set_password(self, raw_password):
        self.password_hash = generate_password_hash(raw_password)

    def check_password(self, raw_password):
        return check_password_hash(self.password_hash, raw_password)

    @property
    def has_completed(self):
        return self.quiz_submitted_at is not None and self.score is not None

    def to_public_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "college_name": self.college_name,
            "email": self.email,
            "phone_number": self.phone_number,
            "completed": self.has_completed,
        }

    def to_admin_dict(self):
        detail = {}
        for v in self.violation_log.all():
            detail[v.type] = detail.get(v.type, 0) + 1

        data = self.to_public_dict()
        data.update(
            {
                "score": self.score,
                "completed_time": self.completed_time,
                "violations": self.violation_count,
                "violations_detail": [{"type": t, "count": c} for t, c in detail.items()],
                "started_at": self.quiz_started_at.isoformat() if self.quiz_started_at else None,
                "submitted_at": self.quiz_submitted_at.isoformat() if self.quiz_submitted_at else None,
            }
        )
        return data


class Violation(db.Model):
    __tablename__ = "violations"

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("students.id"), nullable=False, index=True)
    type = db.Column(db.String(40), nullable=False)
    at = db.Column(db.DateTime, nullable=False)

    student = db.relationship("Student", backref=db.backref("violation_log", lazy="dynamic", cascade="all, delete-orphan"))

    def to_dict(self):
        return {"type": self.type, "at": self.at.isoformat() + "Z"}


class Admin(db.Model):
    __tablename__ = "admins"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    phone_number = db.Column(db.String(20), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)

    def set_password(self, raw_password):
        self.password_hash = generate_password_hash(raw_password)

    def check_password(self, raw_password):
        return check_password_hash(self.password_hash, raw_password)

    def to_dict(self):
        return {"id": self.id, "name": self.name, "phone_number": self.phone_number}