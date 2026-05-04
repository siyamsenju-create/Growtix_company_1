import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("err");
      setMessage("Missing token. Use the link from your email or request a new one.");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        await api<{ ok: boolean }>("/auth/verify-email/confirm", {
          method: "POST",
          body: JSON.stringify({ token }),
          skipAuth: true,
        });
        if (!cancelled) {
          setStatus("ok");
          setMessage("Your email is verified. You can sign in.");
        }
      } catch (e) {
        if (!cancelled) {
          setStatus("err");
          setMessage(e instanceof Error ? e.message : "Verification failed.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem" }}>
      <div className="card" style={{ width: "min(440px, 100%)", padding: "2rem" }}>
        <h1 className="display" style={{ fontSize: "1.75rem", marginTop: 0 }}>
          Email verification
        </h1>
        {status === "idle" && <p style={{ color: "var(--muted)" }}>Confirming…</p>}
        {status === "ok" && <p style={{ color: "var(--success)" }}>{message}</p>}
        {status === "err" && <p style={{ color: "crimson" }}>{message}</p>}
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
