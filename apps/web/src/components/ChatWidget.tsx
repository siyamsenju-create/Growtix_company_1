import { useState, type FormEvent } from "react";
import { api } from "@/lib/api";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await api<{ reply: string }>("/ai/chat", {
        method: "POST",
        body: JSON.stringify({ message: message.trim() }),
        skipAuth: true,
      });
      setReply(res.reply);
      setMessage("");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Chat failed (log in to use full AI, or set OPENAI_API_KEY on the API).");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: "fixed", bottom: "1.25rem", right: "1.25rem", zIndex: 50 }}>
      {open ? (
        <div className="card" style={{ width: "min(360px, calc(100vw - 2rem))", padding: "1rem", boxShadow: "var(--shadow)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <strong>Growtix AI</strong>
            <button type="button" className="btn btn-ghost" style={{ padding: "0.25rem 0.5rem", fontSize: "0.8125rem" }} onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
          <p style={{ fontSize: "0.8125rem", color: "var(--muted)", marginTop: 0 }}>
            Ask about lead generation. Demo replies need API key; logged-in users route through the backend.
          </p>
          <form onSubmit={onSubmit} style={{ display: "grid", gap: "0.5rem", marginTop: "0.75rem" }}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="How can Growtix help?"
              style={{
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "0.5rem 0.65rem",
                background: "var(--bg)",
                color: "var(--text)",
                resize: "vertical",
              }}
            />
            {err && <p style={{ color: "crimson", fontSize: "0.8125rem", margin: 0 }}>{err}</p>}
            {reply && (
              <div style={{ fontSize: "0.875rem", background: "var(--surface-2)", padding: "0.65rem", borderRadius: 8, whiteSpace: "pre-wrap" }}>
                {reply}
              </div>
            )}
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ justifySelf: "start" }}>
              {loading ? "Sending…" : "Send"}
            </button>
          </form>
        </div>
      ) : (
        <button type="button" className="btn btn-primary" style={{ boxShadow: "var(--shadow)" }} onClick={() => setOpen(true)}>
          Chat with AI
        </button>
      )}
    </div>
  );
}
