import { useState, type CSSProperties, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";

export function ForgotPasswordPage() {
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    try {
      await api<{ ok: boolean }>("/auth/password-reset/request", {
        method: "POST",
        body: JSON.stringify({ email: String(fd.get("email")).toLowerCase() }),
        skipAuth: true,
      });
      setDone(true);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Request failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem" }}>
      <div className="card" style={{ width: "min(400px, 100%)", padding: "2rem" }}>
        <h1 className="display" style={{ fontSize: "2rem", marginTop: 0 }}>
          Forgot password
        </h1>
        {done ? (
          <p style={{ color: "var(--muted)" }}>
            If an account exists for that email, we sent reset instructions. Check your inbox and spam folder.
          </p>
        ) : (
          <form onSubmit={onSubmit} style={{ display: "grid", gap: "1rem" }}>
            <label style={label}>
              Work email
              <input name="email" type="email" required style={input} autoComplete="email" />
            </label>
            {err && <p style={{ color: "crimson", margin: 0, fontSize: "0.875rem" }}>{err}</p>}
            <button type="submit" className="btn btn-primary" disabled={pending}>
              {pending ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}
        <p style={{ marginTop: "1.25rem", fontSize: "0.875rem" }}>
          <Link to="/login" style={{ color: "var(--accent)", fontWeight: 600 }}>
            Back to log in
          </Link>
        </p>
      </div>
    </main>
  );
}

const label: CSSProperties = { display: "grid", gap: "0.35rem", fontSize: "0.875rem" };
const input: CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: "0.6rem 0.75rem",
  background: "var(--bg)",
  color: "var(--text)",
};
