import { useState, type CSSProperties, type FormEvent } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { api, setTokens } from "@/lib/api";
import { useAuth } from "@/auth/AuthContext";

export function ResetPasswordPage() {
  const { refreshUser } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") ?? "";
  const [err, setErr] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    if (!token) {
      setErr("Missing reset token. Open the link from your email.");
      return;
    }
    const fd = new FormData(e.currentTarget);
    const a = String(fd.get("password"));
    const b = String(fd.get("password2"));
    if (a !== b) {
      setErr("Passwords do not match.");
      return;
    }
    if (a.length < 8) {
      setErr("Use at least 8 characters.");
      return;
    }
    setPending(true);
    try {
      const res = await api<{
        accessToken: string;
        refreshToken: string;
        user: { id: string; email: string; role: "client" | "admin"; orgId: string; emailVerified?: boolean };
      }>("/auth/password-reset/confirm", {
        method: "POST",
        body: JSON.stringify({ token, newPassword: a }),
        skipAuth: true,
      });
      setTokens(res.accessToken, res.refreshToken);
      await refreshUser();
      navigate("/app/leads", { replace: true });
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Reset failed");
    } finally {
      setPending(false);
    }
  }

  if (!token) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem" }}>
        <div className="card" style={{ maxWidth: "420px", padding: "2rem" }}>
          <p>Missing token.</p>
          <Link to="/forgot-password">Request a new link</Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem" }}>
      <div className="card" style={{ width: "min(400px, 100%)", padding: "2rem" }}>
        <h1 className="display" style={{ fontSize: "2rem", marginTop: 0 }}>
          Set new password
        </h1>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: "1rem" }}>
          <label style={label}>
            New password
            <input name="password" type="password" required minLength={8} style={input} autoComplete="new-password" />
          </label>
          <label style={label}>
            Confirm password
            <input name="password2" type="password" required minLength={8} style={input} autoComplete="new-password" />
          </label>
          <p style={{ fontSize: "0.8125rem", color: "var(--muted)", margin: 0 }}>Use at least 8 characters.</p>
          {err && <p style={{ color: "crimson", margin: 0, fontSize: "0.875rem" }}>{err}</p>}
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Saving…" : "Update password"}
          </button>
        </form>
        <p style={{ marginTop: "1rem", fontSize: "0.875rem" }}>
          <Link to="/login">Log in</Link>
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
