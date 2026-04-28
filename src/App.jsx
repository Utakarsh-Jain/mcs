import { useEffect, useMemo, useState } from "react";
import { AuthScreen } from "./components/AuthScreen";
import { GameShell } from "./components/GameShell";
import { LeaderboardPanel } from "./components/LeaderboardPanel";
import { ResultScreen } from "./components/ResultScreen";
import { fetchLeaderboard, registerOrLogin, submitScore } from "./lib/api";

function App() {
  const [session, setSession] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [screen, setScreen] = useState("auth");
  const [lastResult, setLastResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const boot = async () => {
      const data = await fetchLeaderboard();
      setLeaderboard(data);
    };
    boot();
  }, []);

  const topScore = useMemo(() => leaderboard[0]?.score ?? 0, [leaderboard]);

  async function handleAuth(form) {
    setLoadingAuth(true);
    setError("");
    try {
      const nextSession = await registerOrLogin(form);
      setSession(nextSession);
      setScreen("intro");
    } catch (authError) {
      setError(authError.message || "Could not sign in.");
    } finally {
      setLoadingAuth(false);
    }
  }

  async function handleGameComplete(result) {
    setLastResult(result);
    setScreen(result.status === "victory" ? "victory" : "gameover");

    if (!session) {
      return;
    }

    const scoreEntry = await submitScore({
      userId: session.id,
      playerName: session.name,
      score: result.score,
      correct: result.correct,
      wrong: result.wrong,
      hintsUsed: result.hintsUsed,
      hackerPct: result.hackerPct,
      timeLeft: result.timeLeft,
      finishedAt: new Date().toISOString()
    });

    setLeaderboard((current) => {
      const merged = [scoreEntry, ...current]
        .sort((a, b) => b.score - a.score || a.hackerPct - b.hackerPct)
        .slice(0, 10);
      return merged;
    });
  }

  function handleReplay() {
    setScreen("intro");
    setLastResult(null);
  }

  function handleStartMission() {
    setScreen("game");
  }

  return (
    <div className="app-shell">
      <main className="app-main">
        {screen === "auth" && (
          <AuthScreen
            error={error}
            isLoading={loadingAuth}
            onSubmit={handleAuth}
            topScore={topScore}
          />
        )}

        {(screen === "intro" || screen === "game") && session && (
          <GameShell
            player={session}
            mode={screen}
            onComplete={handleGameComplete}
            onStart={handleStartMission}
          />
        )}

        {(screen === "victory" || screen === "gameover") && lastResult && session && (
          <ResultScreen
            player={session}
            result={lastResult}
            type={screen}
            onReplay={handleReplay}
          />
        )}
      </main>

      <aside className="app-aside">
        <LeaderboardPanel leaderboard={leaderboard} session={session} />
      </aside>
    </div>
  );
}

export default App;
