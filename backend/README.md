# Hack The Database API

Backend API for the React frontend.

## Endpoints

- `POST /auth`
- `POST /scores`
- `GET /leaderboard`
- `GET /health`

## Local run

```bash
npm install
npm start
```

Create a `.env` from `.env.example` first.

## Render settings

- Service type: `Web Service`
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`

Environment variables:

- `DATABASE_URL`
- `FRONTEND_ORIGIN=https://mcs12.vercel.app`
- `PORT=4000` (optional on Render)
