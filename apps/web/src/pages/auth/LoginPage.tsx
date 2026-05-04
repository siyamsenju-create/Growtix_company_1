import { useState, type CSSProperties } from "react";
import type { FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";

export function LoginPage() {
  const { login, user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (user) return <Navigate to="/app/leads" replace />;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    try {
      await login(String(fd.get("email")), String(fd.get("password")));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem" }}>
      <div className="card" style={{ width: "min(400px, 100%)", padding: "2rem" }}>
        <h1 className="display" style={{ fontSize: "2rem", marginTop: 0 }}>
          Log in
        </h1>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: "1rem" }}>
          <label style={label}>
            Email
            <input name="email" type="email" required style={input} autoComplete="email" />
          </label>
          <label style={label}>
            Password
            <input name="password" type="password" required style={input} autoComplete="current-password" />
          </label>
          {error && <p style={{ color: "crimson", margin: 0, fontSize: "0.875rem" }}>{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p style={{ color: "var(--muted)", fontSize: "0.875rem", marginTop: "1.25rem" }}>
          No account? <Link to="/register" style={{ color: "var(--accent)", fontWeight: 600 }}>Register</Link>
        </p>
        <p>
          <Link to="/" style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
            ← Back to site
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
