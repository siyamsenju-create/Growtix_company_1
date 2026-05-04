import { useState, type CSSProperties } from "react";

export function BookPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="container" style={{ padding: "3rem 0 4rem", maxWidth: "720px" }}>
      <h1 className="display" style={{ fontSize: "2.75rem", marginBottom: "0.5rem" }}>
        Book a strategy call
      </h1>
      <p style={{ color: "var(--muted)", marginBottom: "2rem" }}>
        Share your goals and we will follow up. Embed Cal.com or Calendly below in production.
      </p>

      {!submitted ? (
        <form
          className="card"
          style={{ display: "grid", gap: "1rem" }}
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
        >
          <label style={{ display: "grid", gap: "0.35rem", fontSize: "0.875rem" }}>
            Full name
            <input required name="name" style={inputStyle} />
          </label>
          <label style={{ display: "grid", gap: "0.35rem", fontSize: "0.875rem" }}>
            Work email
            <input required name="email" type="email" style={inputStyle} />
          </label>
          <label style={{ display: "grid", gap: "0.35rem", fontSize: "0.875rem" }}>
            Company
            <input required name="company" style={inputStyle} />
          </label>
          <label style={{ display: "grid", gap: "0.35rem", fontSize: "0.875rem" }}>
            Role
            <input name="role" style={inputStyle} />
          </label>
          <label style={{ display: "grid", gap: "0.35rem", fontSize: "0.875rem" }}>
            What are you hoping to achieve?
            <textarea name="goals" rows={4} style={{ ...inputStyle, resize: "vertical" }} />
          </label>
          <button type="submit" className="btn btn-primary" style={{ justifySelf: "start" }}>
            Request a call
          </button>
        </form>
      ) : (
        <div className="card" style={{ color: "var(--muted)" }}>
          Thanks — this demo does not send email; wire your form handler or calendar embed here.
        </div>
      )}

      <div className="card" style={{ marginTop: "2rem", minHeight: "360px", display: "grid", placeItems: "center", color: "var(--muted)" }}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Calendar embed</div>
          <p style={{ margin: 0, maxWidth: "420px" }}>
            Replace this placeholder with your Cal.com or Calendly iframe for instant scheduling.
          </p>
        </div>
      </div>
    </main>
  );
}

const inputStyle: CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: "0.6rem 0.75rem",
  background: "var(--bg)",
  color: "var(--text)",
};
