import "dotenv/config";
import cors from "cors";
import express from "express";
import { query } from "./db.js";

const app = express();
const port = Number(process.env.PORT || 4000);

const allowedOrigins = [
  "http://localhost:4173",
  "http://127.0.0.1:4173",
  process.env.FRONTEND_ORIGIN
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS"));
    }
  })
);

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    service: "hack-the-database-api",
    status: "ok"
  });
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/auth", async (req, res) => {
  const name = req.body?.name?.trim();
  const email = req.body?.email?.trim().toLowerCase();

  if (!name || !email) {
    res.status(400).json({ error: "name and email are required" });
    return;
  }

  try {
    const existingUser = await query(
      `
      select id, name, email, created_at
      from users
      where email = $1
      limit 1
      `,
      [email]
    );

    if (existingUser.rows.length > 0) {
      const user = existingUser.rows[0];

      if (user.name !== name) {
        const updatedUser = await query(
          `
          update users
          set name = $1
          where email = $2
          returning id, name, email, created_at
          `,
          [name, email]
        );
        res.json(updatedUser.rows[0]);
        return;
      }

      res.json(user);
      return;
    }

    const insertedUser = await query(
      `
      insert into users (name, email)
      values ($1, $2)
      returning id, name, email, created_at
      `,
      [name, email]
    );

    res.status(201).json(insertedUser.rows[0]);
  } catch (error) {
    console.error("POST /auth failed", error);
    res.status(500).json({ error: "Could not authenticate user" });
  }
});

app.post("/scores", async (req, res) => {
  const {
    userId,
    playerName,
    score = 0,
    correct = 0,
    wrong = 0,
    hintsUsed = 0,
    hackerPct = 0,
    timeLeft = 0,
    finishedAt
  } = req.body ?? {};

  if (!userId || !playerName) {
    res.status(400).json({ error: "userId and playerName are required" });
    return;
  }

  try {
    const insertedScore = await query(
      `
      insert into scores (
        user_id,
        player_name,
        score,
        correct,
        wrong,
        hints_used,
        hacker_pct,
        time_left,
        finished_at
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, coalesce($9::timestamp, current_timestamp))
      returning
        id,
        user_id as "userId",
        player_name as "playerName",
        score,
        correct,
        wrong,
        hints_used as "hintsUsed",
        hacker_pct as "hackerPct",
        time_left as "timeLeft",
        finished_at as "finishedAt"
      `,
      [userId, playerName, score, correct, wrong, hintsUsed, hackerPct, timeLeft, finishedAt ?? null]
    );

    res.status(201).json(insertedScore.rows[0]);
  } catch (error) {
    console.error("POST /scores failed", error);
    res.status(500).json({ error: "Could not save score" });
  }
});

app.get("/leaderboard", async (_req, res) => {
  try {
    const leaderboard = await query(
      `
      select
        id,
        user_id as "userId",
        player_name as "playerName",
        score,
        correct,
        wrong,
        hints_used as "hintsUsed",
        hacker_pct as "hackerPct",
        time_left as "timeLeft",
        finished_at as "finishedAt"
      from scores
      order by score desc, hacker_pct asc, finished_at desc
      limit 10
      `
    );

    res.json(leaderboard.rows);
  } catch (error) {
    console.error("GET /leaderboard failed", error);
    res.status(500).json({ error: "Could not load leaderboard" });
  }
});

app.use((err, _req, res, _next) => {
  console.error("Unhandled API error", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Hack The Database API listening on port ${port}`);
});
