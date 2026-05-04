import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

export function RegisterCheckEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = (location.state as { email?: string } | null)?.email ?? "";
  const [cooldown, setCooldown] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function resend() {
    if (cooldown > 0) return;
    setErr(null);
    setMsg(null);
    try {
      await api<void>("/auth/verify-email/request", {
        method: "POST",
        body: JSON.stringify({ email }),
        skipAuth: true,
      });
      setMsg("If an account needs verification, we sent another email.");
      setCooldown(60);
      const id = window.setInterval(() => {
        setCooldown((s) => {
          if (s <= 1) {
            window.clearInterval(id);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not resend");
    }
  }

  if (!email) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem" }}>
        <div className="card" style={{ maxWidth: "420px", padding: "2rem" }}>
          <p style={{ marginTop: 0 }}>Missing email context.</p>
          <Link to="/register">Back to register</Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem" }}>
      <div className="card" style={{ width: "min(440px, 100%)", padding: "2rem" }}>
        <h1 className="display" style={{ fontSize: "1.75rem", marginTop: 0 }}>
          Check your email
        </h1>
        <p style={{ color: "var(--muted)" }}>
          We sent a verification link to <strong>{email}</strong>. Open the link to verify your address, then you can use
          the app as usual.
        </p>
        {msg && <p style={{ color: "var(--success)", fontSize: "0.875rem" }}>{msg}</p>}
        {err && <p style={{ color: "crimson", fontSize: "0.875rem" }}>{err}</p>}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "1rem" }}>
          <button type="button" className="btn btn-primary" disabled={cooldown > 0} onClick={resend}>
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend email"}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate("/app/leads")}>
            Continue to dashboard
          </button>
        </div>
        <p style={{ marginTop: "1.5rem", fontSize: "0.875rem" }}>
          <Link to="/login" style={{ color: "var(--accent)", fontWeight: 600 }}>
            Log in
          </Link>{" "}
          ·{" "}
          <Link to="/" style={{ color: "var(--muted)" }}>
            Home
          </Link>
        </p>
      </div>
    </main>
  );
}
