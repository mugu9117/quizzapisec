import json
import random
import re
from pathlib import Path

QUESTIONS_PATH = Path(__file__).resolve().parent.parent / "data" / "questions.json"

_QUESTION_CACHE = None


def load_questions():
    global _QUESTION_CACHE
    if _QUESTION_CACHE is None:
        with open(str(QUESTIONS_PATH), encoding="utf-8") as fh:
            _QUESTION_CACHE = json.load(fh)
    return _QUESTION_CACHE


def questions_by_id():
    return {str(q["id"]): q for q in load_questions()}


def _shuffled_options(question, salt):
    options = list(question.get("options", []))
    rng = random.Random(f"{salt}-{question['id']}")
    rng.shuffle(options)
    return options


def build_quiz_payload(questions, salt):
    """Return questions for the client WITHOUT the correct answer.

    Question order and option order are randomized deterministically per
    student (seeded by ``salt``) so a refreshed quiz looks identical.
    """
    rng = random.Random(f"{salt}")
    ordered = list(questions)
    rng.shuffle(ordered)

    payload = []
    for question in ordered:
        payload.append(
            {
                "id": question["id"],
                "language": question.get("language", ""),
                "difficulty": question.get("difficulty", ""),
                "question": question["question"],
                "options": _shuffled_options(question, salt),
            }
        )
    return payload


def grade_submission(answers, salt):
    """Compare selected options against questions.json.

    ``answers`` is a dict mapping question id (string or int) to the selected
    option text. Returns a dict with correct, wrong and total counts.
    """
    questions = questions_by_id()
    correct = 0
    wrong = 0
    total = len(questions)

    if not isinstance(answers, dict):
        return {"correct": 0, "wrong": total, "total": total}

    for qid, question in questions.items():
        selected = answers.get(qid)
        if selected is None:
            wrong += 1
            continue
        if question["answer"] == selected:
            correct += 1
        else:
            wrong += 1

    return {"correct": correct, "wrong": wrong, "total": total}


PHONE_RE = re.compile(r"^[6-9]\d{9}$")
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def normalize_phone(phone_number):
    return re.sub(r"[^0-9]", "", phone_number or "")


def is_valid_phone(phone_number):
    return bool(PHONE_RE.match(phone_number or ""))


def is_valid_email(email):
    return bool(EMAIL_RE.match(email or ""))