from datetime import datetime, timezone

from flask import Blueprint, current_app, g, jsonify, request

from extensions import db
from models import Violation
from utils.auth import student_required
from utils.quiz import build_quiz_payload, grade_submission, load_questions


def utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)


VIOLATION_WEIGHTS = {
    "AI_APP_SWITCH": 2,
    "COPY": 2,
    "PASTE": 2,
    "CUT": 2,
    "FULLSCREEN_EXIT": 1,
    "CONTEXT_MENU": 1,
    "TAB_SWITCH": 1,
    "WINDOW_BLUR": 1,
}


quiz_bp = Blueprint("quiz", __name__)


def _duration():
    return current_app.config["QUIZ_DURATION_SECONDS"]


def _violation_limit():
    return current_app.config["QUIZ_VIOLATION_LIMIT"]


def _result_payload(student):
    total = len(load_questions())
    correct = student.score if student.score is not None else 0
    wrong = max(0, total - correct)
    percentage = round((correct / total) * 100, 1) if total else 0.0
    return {
        "submitted": student.has_completed,
        "score": correct,
        "total": total,
        "correct": correct,
        "wrong": wrong,
        "percentage": percentage,
        "completed_time": student.completed_time,
        "violations": student.violation_count,
        "submitted_at": student.quiz_submitted_at.isoformat() if student.quiz_submitted_at else None,
    }


def _finalize_submission(student, answers, force_duration=None):
    result = grade_submission(answers, salt=str(student.id))
    student.score = result["correct"]

    now = utcnow()
    if student.quiz_started_at is None:
        student.quiz_started_at = now

    elapsed = int((now - student.quiz_started_at).total_seconds())
    if force_duration is not None:
        elapsed = force_duration
    student.completed_time = max(0, min(elapsed, _duration()))
    student.quiz_submitted_at = now
    db.session.commit()
    return _result_payload(student)


@quiz_bp.get("/start")
@student_required
def start_quiz():
    student = g.student

    if student.has_completed:
        return jsonify({"submitted": True, "result": _result_payload(student)}), 200

    if student.violation_count >= _violation_limit():
        result = _finalize_submission(student, {}, force_duration=_duration())
        return jsonify({"submitted": True, "result": result}), 200

    if student.quiz_started_at is None:
        student.quiz_started_at = utcnow()
        db.session.commit()

    elapsed = int((utcnow() - student.quiz_started_at).total_seconds())
    remaining = max(0, _duration() - elapsed)

    if remaining <= 0:
        result = _finalize_submission(student, {}, force_duration=_duration())
        return jsonify({"submitted": True, "result": result}), 200

    questions = load_questions()
    payload = build_quiz_payload(questions, salt=str(student.id))

    return (
        jsonify(
            {
                "submitted": False,
                "duration": _duration(),
                "remaining": remaining,
                "started_at": student.quiz_started_at.isoformat() + "Z",
                "violation_limit": _violation_limit(),
                "questions": payload,
            }
        ),
        200,
    )


@quiz_bp.post("/submit")
@student_required
def submit_quiz():
    student = g.student
    data = request.get_json(silent=True) or {}
    answers = data.get("answers") or {}
    duration = _duration()

    if student.has_completed:
        return jsonify({"result": _result_payload(student)}), 200

    started = student.quiz_started_at or utcnow()
    if student.quiz_started_at is None:
        student.quiz_started_at = started

    elapsed = int((utcnow() - started).total_seconds())

    result = _finalize_submission(
        student,
        answers,
        force_duration=duration if elapsed >= duration else None,
    )
    return jsonify({"result": result}), 200


@quiz_bp.post("/violation")
@student_required
def record_violation():
    student = g.student
    data = request.get_json(silent=True) or {}

    if student.has_completed:
        return jsonify({"violation_count": student.violation_count,
                        "violation_limit": _violation_limit(),
                        "should_submit": False}), 200

    violation_type = (data.get("type") or "UNKNOWN").strip()[:40] or "UNKNOWN"
    weight = VIOLATION_WEIGHTS.get(violation_type, 1)

    db.session.add(Violation(student_id=student.id, type=violation_type, at=utcnow()))
    student.violation_count = (student.violation_count or 0) + weight
    db.session.commit()

    should_submit = student.violation_count >= _violation_limit()
    return (
        jsonify(
            {
                "violation_count": student.violation_count,
                "violation_limit": _violation_limit(),
                "should_submit": should_submit,
                "recorded": True,
            }
        ),
        200,
    )


@quiz_bp.get("/result")
@student_required
def get_result():
    student = g.student
    if not student.has_completed:
        return jsonify({"submitted": False}), 200
    return jsonify({"submitted": True, "result": _result_payload(student)}), 200