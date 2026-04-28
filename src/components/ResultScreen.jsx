function formatTime(seconds) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

export function ResultScreen({ onReplay, player, result, type }) {
  const isSecured = type === "victory" && result.score >= 1000;
  
  const title = isSecured ? "Database Secured" : "Security Compromised";
  const subtitle = isSecured
    ? "Mission complete. The attacker has been locked out."
    : result.score < 1000 && type === "victory"
      ? "Database nominally secured, but low performance left backdoors open."
      : "Mission failed. The attacker completed the breach.";

  const handleRedirect = () => {
    window.location.href = "https://mcs12.vercel.app/"; // Placeholder redirection
  };

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

      <div className="button-group">
        <button className="primary-button" onClick={onReplay}>
          Restart Mission
        </button>
        <button className="secondary-button" onClick={handleRedirect}>
          Exit to Dashboard
        </button>
      </div>
    </section>
  );
}
