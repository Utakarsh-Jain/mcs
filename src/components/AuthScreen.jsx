import { useState } from "react";

export function AuthScreen({ error, isLoading, onSubmit, topScore }) {
  const [form, setForm] = useState({
    name: "",
    email: ""
  });

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase()
    });
  }

  return (
    <section className="screen screen-center">
      <div className="hero-title">Hack The Database</div>
      <div className="hero-subtitle">Cyber Security Escape Room</div>

      <div className="panel panel-intro">
        <p className="alert-line">
          Alert: a malicious actor is moving through your database stack. Register the player,
          enter the mission, and lock the attacker out before the timer ends.
        </p>
        <p>
          This version is structured for deployment: auth first, game second, score storage
          third. Right now it can run fully in the browser, and later we can point the same
          flow at your hosted backend and SQL database.
        </p>
        <div className="meta-grid">
          <div>
            <span className="label">Mission Flow</span>
            <strong>Login -&gt; Play -&gt; Save Score</strong>
          </div>
          <div>
            <span className="label">Top Local Score</span>
            <strong>{topScore}</strong>
          </div>
        </div>
      </div>

      <form className="panel auth-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="name">Player name</label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={updateField}
            placeholder="Enter your display name"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={form.email}
            onChange={updateField}
            placeholder="you@example.com"
            required
          />
        </div>

        {error ? <div className="error-banner">{error}</div> : null}

        <button className="primary-button" type="submit" disabled={isLoading}>
          {isLoading ? "Authenticating..." : "Access Mission"}
        </button>
      </form>
    </section>
  );
}
