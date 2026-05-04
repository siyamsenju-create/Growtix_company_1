import { useState, type CSSProperties } from "react";
import type { FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";

export function RegisterPage() {
  const { register, user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (user) return <Navigate to="/app/leads" replace />;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    try {
      await register(String(fd.get("email")), String(fd.get("password")), String(fd.get("orgName")));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem" }}>
      <div className="card" style={{ width: "min(400px, 100%)", padding: "2rem" }}>
        <h1 className="display" style={{ fontSize: "2rem", marginTop: 0 }}>
          Create account
        </h1>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: "1rem" }}>
          <label style={label}>
            Organization name
            <input name="orgName" required style={input} />
          </label>
          <label style={label}>
            Email
            <input name="email" type="email" required style={input} autoComplete="email" />
          </label>
          <label style={label}>
            Password
            <input name="password" type="password" required minLength={8} style={input} autoComplete="new-password" />
          </label>
          {error && <p style={{ color: "crimson", margin: 0, fontSize: "0.875rem" }}>{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Creating…" : "Create account"}
          </button>
        </form>
        <p style={{ color: "var(--muted)", fontSize: "0.875rem", marginTop: "1.25rem" }}>
          Have an account? <Link to="/login" style={{ color: "var(--accent)", fontWeight: 600 }}>Log in</Link>
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
