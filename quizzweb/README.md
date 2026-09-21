# Quiz Competition — Frontend

React + Vite frontend for the Sengunthar Engineering College quiz competition.

- Stack: React 19, React Router 7, Axios, Vite.
- Pages: Landing, Login, Register, Quiz, Result, Admin Login, Admin Dashboard.
- Reusable design system in `src/styles` and `src/components`.

See the repo root `README.md` for full setup, backend and environment instructions.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build
npm run lint
```

The API base URL defaults to `http://localhost:5000/api`; override with the `VITE_API_URL` environment variable (see `.env.example`).