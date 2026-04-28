import { useEffect, useMemo, useState } from "react";
import { GAME_CONFIG, ROOMS } from "../data/rooms";

function getInitialGameState() {
  return {
    roomIndex: 0,
    questionIndex: 0,
    score: 0,
    correct: 0,
    wrong: 0,
    hintsUsed: 0,
    hackerPct: 0,
    timeLeft: GAME_CONFIG.totalTimeSeconds,
    answered: false,
    selectedOption: null,
    hintText: "",
    log: ["[SYS] Awaiting mission start..."],
    status: "intro"
  };
}

function formatTime(seconds) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

function getHintForState(gameState) {
  const room = ROOMS[gameState.roomIndex];
  return room.hints[gameState.questionIndex];
}

export function GameShell({ mode, onComplete, onStart, player }) {
  const [game, setGame] = useState(getInitialGameState);

  const room = ROOMS[game.roomIndex];
  const question = room.questions[game.questionIndex];

  useEffect(() => {
    if (mode === "intro") {
      setGame(getInitialGameState());
    }
  }, [mode]);

  useEffect(() => {
    if (mode !== "game") {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setGame((current) => {
        if (current.timeLeft <= 1) {
          window.clearInterval(timer);
          const result = {
            status: "gameover",
            score: current.score,
            correct: current.correct,
            wrong: current.wrong,
            hintsUsed: current.hintsUsed,
            hackerPct: current.hackerPct,
            timeLeft: 0
          };
          window.setTimeout(() => onComplete(result), 0);
          return { ...current, timeLeft: 0 };
        }

        return { ...current, timeLeft: current.timeLeft - 1 };
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [mode, onComplete]);

  const progress = useMemo(
    () =>
      ROOMS.map((entry, index) => ({
        id: entry.id,
        label: String(index + 1).padStart(2, "0"),
        state: index < game.roomIndex ? "done" : index === game.roomIndex ? "active" : "idle"
      })),
    [game.roomIndex]
  );

  function addLog(message) {
    setGame((current) => ({
      ...current,
      log: [...current.log, message].slice(-8)
    }));
  }

  function handleStart() {
    setGame((current) => ({
      ...current,
      status: "game",
      log: [`[SYS] Agent ${player.name} entered the mission.`]
    }));
    onStart();
  }

  function handleAnswer(optionIndex) {
    if (game.answered) {
      return;
    }

    const option = question.options[optionIndex];

    setGame((current) => {
      const next = {
        ...current,
        answered: true,
        selectedOption: optionIndex
      };

      if (option.correct) {
        next.score += GAME_CONFIG.scorePerCorrect;
        next.correct += 1;
        next.log = [...current.log, `[OK] ${room.badge} patched successfully.`].slice(-8);
      } else {
        next.wrong += 1;
        next.hackerPct = Math.min(100, current.hackerPct + GAME_CONFIG.wrongAnswerHackerPenalty);
        next.log = [...current.log, `[!!] Wrong answer. Hacker progress ${next.hackerPct}%.`].slice(-8);
      }

      return next;
    });
  }

  useEffect(() => {
    if (!game.answered || game.hackerPct < 100) {
      return;
    }

    onComplete({
      status: "gameover",
      score: game.score,
      correct: game.correct,
      wrong: game.wrong,
      hintsUsed: game.hintsUsed,
      hackerPct: game.hackerPct,
      timeLeft: game.timeLeft
    });
  }, [game, onComplete]);

  function handleNext() {
    const isLastQuestion = game.questionIndex === room.questions.length - 1;
    const isLastRoom = game.roomIndex === ROOMS.length - 1;

    if (isLastQuestion && isLastRoom) {
      onComplete({
        status: "victory",
        score: game.score,
        correct: game.correct,
        wrong: game.wrong,
        hintsUsed: game.hintsUsed,
        hackerPct: game.hackerPct,
        timeLeft: game.timeLeft
      });
      return;
    }

    if (isLastQuestion) {
      setGame((current) => ({
        ...current,
        roomIndex: current.roomIndex + 1,
        questionIndex: 0,
        answered: false,
        selectedOption: null,
        hintText: ""
      }));
      addLog(`[SYS] Transitioning to ${ROOMS[game.roomIndex + 1].badge}.`);
      return;
    }

    setGame((current) => ({
      ...current,
      questionIndex: current.questionIndex + 1,
      answered: false,
      selectedOption: null,
      hintText: ""
    }));
  }

  function handleHint() {
    if (game.timeLeft <= GAME_CONFIG.hintPenaltySeconds) {
      addLog("[!!] Not enough time remaining for a hint.");
      return;
    }

    setGame((current) => ({
      ...current,
      timeLeft: current.timeLeft - GAME_CONFIG.hintPenaltySeconds,
      hintsUsed: current.hintsUsed + 1,
      hintText: getHintForState(current)
    }));
    addLog(`[SYS] Hint requested. ${GAME_CONFIG.hintPenaltySeconds}s deducted.`);
  }

  if (mode === "intro") {
    return (
      <section className="screen screen-center">
        <div className="hero-title">Welcome, {player.name}</div>
        <div className="hero-subtitle">5 rooms. 300 seconds. One database stack to save.</div>
        <div className="panel panel-intro">
          <p>
            You wanted a flow where players sign in first, then play, and finally store their
            results. That structure is now built in, and the same frontend can later connect to
            your hosted backend and SQL database.
          </p>
          <ul className="brief-list">
            <li>Wrong answers increase hacker progress.</li>
            <li>Hints cost 20 seconds.</li>
            <li>Scores can be persisted locally now or sent to an API later.</li>
          </ul>
        </div>
        <button className="primary-button" onClick={handleStart}>
          Initialize Mission
        </button>
      </section>
    );
  }

  const feedbackType =
    game.selectedOption == null
      ? null
      : question.options[game.selectedOption].correct
        ? "correct"
        : "wrong";

  return (
    <section className="game-screen">
      <div className="hud">
        <div className="hud-block">
          <span className="label">Time Remaining</span>
          <strong className={game.timeLeft < 60 ? "danger" : ""}>{formatTime(game.timeLeft)}</strong>
        </div>
        <div className="hud-block">
          <span className="label">Score</span>
          <strong>{game.score}</strong>
        </div>
        <div className="hud-block">
          <span className="label">Room</span>
          <strong>
            {game.roomIndex + 1}/{ROOMS.length}
          </strong>
        </div>
        <div className="hud-grow">
          <span className="label danger-text">Hacker Progress</span>
          <div className="meter">
            <div className="meter-fill" style={{ width: `${game.hackerPct}%` }} />
          </div>
        </div>
      </div>

      <div className="game-layout">
        <div className="game-main">
          <div className="progress-row">
            {progress.map((step) => (
              <div key={step.id} className={`progress-dot ${step.state}`}>
                {step.label}
              </div>
            ))}
          </div>

          <div className="panel room-header">
            <div className="stage-badge">{room.badge}</div>
            <h2>{room.title}</h2>
            <p>{room.context}</p>
          </div>

          <div className="panel terminal">
            {room.terminal.map((line, index) => (
              <div key={`${line.text}-${index}`} className={`terminal-line ${line.type}`}>
                {line.text}
              </div>
            ))}
          </div>

          <div className="panel question-card">
            <div className="question-label">
              Question {game.questionIndex + 1} / {room.questions.length}
            </div>
            <p className="question-text">{question.text}</p>

            <div className="options-grid">
              {question.options.map((option, index) => {
                const isSelected = game.selectedOption === index;
                const isCorrect = option.correct;
                const stateClass = game.answered
                  ? isCorrect
                    ? "correct"
                    : isSelected
                      ? "wrong"
                      : "dimmed"
                  : "";

                return (
                  <button
                    key={option.text}
                    className={`option-button ${stateClass}`}
                    onClick={() => handleAnswer(index)}
                    disabled={game.answered}
                  >
                    <span>{String.fromCharCode(65 + index)}</span>
                    <span>{option.text}</span>
                  </button>
                );
              })}
            </div>

            {feedbackType ? (
              <div className={`feedback-box ${feedbackType}`}>
                {feedbackType === "correct" ? question.correctFeedback : question.wrongFeedback}
              </div>
            ) : null}

            {game.answered ? (
              <button className="secondary-button" onClick={handleNext}>
                Proceed
              </button>
            ) : null}
          </div>
        </div>

        <aside className="game-sidebar">
          <div className="panel">
            <div className="sidebar-heading">Mission Stats</div>
            <div className="stat-line">
              <span>Correct</span>
              <strong>{game.correct}</strong>
            </div>
            <div className="stat-line">
              <span>Wrong</span>
              <strong className="danger-text">{game.wrong}</strong>
            </div>
            <div className="stat-line">
              <span>Hints Used</span>
              <strong>{game.hintsUsed}</strong>
            </div>
            <div className="stat-line">
              <span>Hacker</span>
              <strong className="danger-text">{game.hackerPct}%</strong>
            </div>
          </div>

          <div className="panel">
            <div className="sidebar-heading">Security Advisor</div>
            <button className="secondary-button full-width" onClick={handleHint}>
              Request Hint (-20s)
            </button>
            <div className="hint-box">
              {game.hintText || "Need a nudge? The hint system reveals guidance without giving the answer away."}
            </div>
          </div>

          <div className="panel">
            <div className="sidebar-heading">System Log</div>
            <div className="log-box">
              {game.log.map((entry, index) => (
                <div key={`${entry}-${index}`}>{entry}</div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
