function formatTime(seconds) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

export function ResultScreen({ onReplay, player, result, type }) {
  const title = type === "victory" ? "Database Secured" : "Database Breached";
  const subtitle =
    type === "victory"
      ? "Mission complete. The attacker has been locked out."
      : "Mission failed. The attacker completed the breach.";

  return (
    <section className="screen screen-center">
      <div className={`hero-title ${type === "gameover" ? "danger-text" : ""}`}>{title}</div>
      <div className="hero-subtitle">{subtitle}</div>

      <div className="panel result-panel">
        <div className="result-player">Agent: {player.name}</div>
        <div className="result-score">Score: {result.score}</div>
        <div className="result-grid">
          <div className="result-card">
            <span className="label">Correct</span>
            <strong>{result.correct}</strong>
          </div>
          <div className="result-card">
            <span className="label">Wrong</span>
            <strong className="danger-text">{result.wrong}</strong>
          </div>
          <div className="result-card">
            <span className="label">Time Left</span>
            <strong>{formatTime(result.timeLeft)}</strong>
          </div>
          <div className="result-card">
            <span className="label">Hacker</span>
            <strong className="danger-text">{result.hackerPct}%</strong>
          </div>
        </div>
      </div>

      <button className="primary-button" onClick={onReplay}>
        Restart Mission
      </button>
    </section>
  );
}
