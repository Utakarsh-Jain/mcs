export function LeaderboardPanel({ leaderboard, session }) {
  return (
    <section className="panel leaderboard-panel">
      <div className="sidebar-heading">Leaderboard</div>
      <div className="leaderboard-subtitle">
        {session ? `Logged in as ${session.name}` : "Players will appear here after they finish."}
      </div>

      {leaderboard.length === 0 ? (
        <div className="empty-state">No runs recorded yet.</div>
      ) : (
        <div className="leaderboard-list">
          {leaderboard.map((entry, index) => (
            <div key={entry.id ?? `${entry.playerName}-${index}`} className="leaderboard-item">
              <div>
                <strong>{entry.playerName}</strong>
                <div className="small-text">
                  {entry.correct} correct · {entry.wrong} wrong
                </div>
              </div>
              <div className="leaderboard-score">{entry.score}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
