import { getTopScores, storeScore, upsertUser } from "./storage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim();

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

export async function registerOrLogin(payload) {
  if (!API_BASE_URL) {
    return upsertUser(payload);
  }

  return request("/auth", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function submitScore(payload) {
  if (!API_BASE_URL) {
    return storeScore(payload);
  }

  return request("/scores", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function fetchLeaderboard() {
  if (!API_BASE_URL) {
    return getTopScores();
  }

  return request("/leaderboard");
}
