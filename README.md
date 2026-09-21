# Quiz Competition

Sengunthar Engineering College — Python & Java programming quiz competition platform.

A full-stack web application: **React (Vite) + Flask REST API + SQLAlchemy ORM + Aiven MySQL**.

## Architecture

```
React (frontend/quizzweb)
   ↓  REST API  (axios + JWT)
Flask REST API (backend)
   ↓  SQLAlchemy ORM
Aiven MySQL (quiz_db)

Quiz questions: backend/data/questions.json
Database stores: students (name, college, email, phone, password_hash) + result (score, completed_time)
```

- **No raw SQL anywhere** — all database work uses the SQLAlchemy ORM (`db.session`, models).
- **No questions table** — the 50 questions (25 Python + 25 Java) live in `backend/data/questions.json`.
- **Answers never reach the browser** — the client is sent only questions + options; the server grades submissions against the JSON.
- **Scores and time are computed on the backend**, and the backend validates the 30-minute duration from the recorded start time (frontend timer is display only).

## Project layout

```
quizz/
├── .gitignore
├── README.md
├── backend/            Flask API
│   ├── app.py          app factory, blueprint wiring, db.create_all(), admin seed
│   ├── config.py       environment-based configuration
│   ├── extensions.py   db / jwt / cors singletons
│   ├── models.py       Student, Admin (SQLAlchemy)
│   ├── data/questions.json   50 questions (25 Python + 25 Java)
│   ├── routes/         auth.py · quiz.py · admin.py
│   ├── utils/          auth.py (JWT guards) · quiz.py (questions/validation) · security.py
│   ├── seed_admin.py   seeds the admin account from .env
│   ├── .env            credentials (never committed)
│   └── .env.example
└── quizzweb/           React + Vite frontend
    └── src/
        ├── components/ 16 reusable UI components
        ├── pages/      Landing, Login, Register, Quiz, Result, AdminLogin, AdminDashboard
        ├── context/    Auth, AdminAuth, Toast
        ├── services/api.js   axios clients for student/admin APIs
        └── styles/     design system (tokens, layout, quiz, dashboard)
```

## Setup

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and fill in your Aiven MySQL credentials and secrets.

```bash
cp .env.example .env
```

Required variables:

```
DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD   # Aiven MySQL
SECRET_KEY, JWT_SECRET_KEY                        # secure random values
ADMIN_PHONE=1234567890
ADMIN_PASSWORD=sec@123                            # change in production
QUIZ_DURATION_SECONDS=1800
QUIZ_VIOLATION_LIMIT=3
```

Run the API (creates tables and seeds the admin automatically):

```bash
python app.py
# serves on http://0.0.0.0:5000
```

### 2. Frontend

```bash
cd quizzweb
npm install
npm run dev
# serves on http://localhost:5173
```

The frontend reads `VITE_API_URL` if set (default `http://localhost:5000/api`). To override, add a `quizzweb/.env.local`:

```
VITE_API_URL=http://localhost:5000/api
```

### 3. Admin access

| Field    | Value        |
| -------- | ------------ |
| Phone    | `1234567890` |
| Password | `sec@123`    |

The admin password is never stored in plain text — `seed_admin.py` hashes it before saving. **Change the admin password in `.env`, delete the `admins` table (or the seeded row) and re-seed for production.**

## API endpoints

| Method | Endpoint               | Auth  | Description                          |
| ------ | ---------------------- | ----- | ------------------------------------ |
| POST   | `/api/auth/register`   | —     | Student registration                 |
| POST   | `/api/auth/login`      | —     | Student login (phone + password) → JWT |
| POST   | `/api/auth/admin-login`| —     | Admin login → JWT                    |
| GET    | `/api/quiz/start`      | student | Randomised questions (no answers) + remaining time |
| POST   | `/api/quiz/submit`     | student | Submit answers → server-graded result |
| POST   | `/api/quiz/violation`  | student | Record a browser-level integrity event |
| GET    | `/api/quiz/result`     | student | Stored result for the logged-in student |
| GET    | `/api/admin/students`  | admin  | All students + scores + completion time |
| DELETE | `/api/admin/students`  | admin  | Delete selected students (`student_ids` list) or reset all (requires `{"confirm": true}`) |

## Student flow

Register → Login → Start Quiz (50 questions, 30:00, random order) → Answer → Submit → Backend grades → Result page (score / percentage / time taken).

## Integrity notes

- Browser-level detection records: tab switches, window blur, fullscreen exit, copy/paste/cut and right-click attempts. Each event increments a counter; the configurable limit (default 3) triggers an automatic submission.
- **Weighted violations**: severe offenses (switching to another app, copy/paste/cut) count as `2` points; minor ones (fullscreen exit, right-click) count as `1`. The limit is measured in weighted points, so 2 severe offenses automatically submit the quiz.
- Each violation is stored with its type on the backend (`violations` table) and shown as a "Violation Log" in the admin student profile.
- Rapid repeats of the same violation type are debounced 1.5s per type on the client so spam cannot inflate the counter.
- **Fullscreen is enforced for the entire exam**: the quiz forces fullscreen on start and automatically re-enters fullscreen whenever the student leaves it, until the quiz is submitted or the time expires.
- **AI / web-search avoidance**: if the quiz window loses focus and the student returns after more than 3 seconds, the return is recorded as an AI/search violation — this also catches switching to AI tools or search engines in the same browser (visibility change) or in other apps (window blur). Accidental sub-second blinks are ignored.
- The timer continues during warnings and is pinned to the backend start time, so reloading or tab-switching cannot extend the exam.
- A plain web page cannot block operating-system level actions (Alt+Tab, other devices, OS search). The system detects in-browser visibility/focus changes and records them — it does not claim to physically prevent OS-level cheating.

## Security

- Passwords hashed with Werkzeug (`generate_password_hash`).
- JWT auth (8 h expiry) with separate student/admin tokens and role claims.
- Admin endpoints guarded by `admin_required`; client-supplied score/time/answers are never trusted.
- Credentials live only in `backend/.env`, which is git-ignored; the React app never sees DB credentials.
- CORS restricted to API paths, authorizing `Content-Type` and `Authorization` headers.