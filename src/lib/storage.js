const USERS_KEY = "hack-db-users";
const SCORES_KEY = "hack-db-scores";

function read(key, fallback) {
  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function upsertUser({ name, email }) {
  const users = read(USERS_KEY, []);
  const existing = users.find((user) => user.email.toLowerCase() === email.toLowerCase());

  if (existing) {
    return existing;
  }

  const user = {
    id: crypto.randomUUID(),
    name,
    email
  };

  users.push(user);
  write(USERS_KEY, users);
  return user;
}

export function storeScore(score) {
  const scores = read(SCORES_KEY, []);
  const entry = { id: crypto.randomUUID(), ...score };
  scores.push(entry);
  write(SCORES_KEY, scores);
  return entry;
}

export function getTopScores(limit = 10) {
  const scores = read(SCORES_KEY, []);
  return scores
    .sort((a, b) => b.score - a.score || a.hackerPct - b.hackerPct)
    .slice(0, limit);
}
