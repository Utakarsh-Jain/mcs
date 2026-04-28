# Hack The Database

React-based version of the escape room game with:

- separated HTML, CSS, and React modules
- register/login gate before gameplay
- local score persistence today
- backend-ready API hooks for Vercel + SQL deployment later

## Run locally

```bash
npm install
npm run dev
```

## Backend integration

Set `VITE_API_BASE_URL` in your environment when your backend is ready.

Expected endpoints:

- `POST /auth` -> `{ name, email }` returns a user object
- `GET /leaderboard` -> returns score entries
- `POST /scores` -> accepts `{ userId, playerName, score, correct, wrong, hintsUsed, hackerPct, timeLeft, finishedAt }`

If `VITE_API_BASE_URL` is empty, the app uses browser `localStorage` so you can demo the whole flow immediately.
