import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type LeadRow = {
  id: string;
  email?: string;
  company?: string;
  status: string;
  score?: number;
  firstName?: string;
  lastName?: string;
};

export function LeadsPage() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ id: string; body: string; direction: string; createdAt?: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api<{ items: LeadRow[] }>("/leads");
        if (!cancelled) setLeads(res.items);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!drawer) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await api<{ items: { id: string; body: string; direction: string; createdAt?: string }[] }>(
          `/leads/${drawer}/messages`
        );
        if (!cancelled) setMessages(res.items);
      } catch {
        if (!cancelled) setMessages([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [drawer]);

  return (
    <div>
      <h1 className="display" style={{ fontSize: "2rem", marginTop: 0 }}>
        Leads
      </h1>
      <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>Sortable table with campaign filters comes next—this MVP lists org leads.</p>

      {loading ? (
        <p style={{ color: "var(--muted)" }}>Loading…</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: drawer ? "1fr 340px" : "1fr", gap: "1rem", alignItems: "start" }}>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Email</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id}>
                    <td>
                      {[l.firstName, l.lastName].filter(Boolean).join(" ") || "—"}
                    </td>
                    <td>{l.company ?? "—"}</td>
                    <td>{l.email ?? "—"}</td>
                    <td>{l.score ?? "—"}</td>
                    <td>{l.status}</td>
                    <td>
                      <button type="button" className="btn btn-ghost" style={{ padding: "0.35rem 0.75rem", fontSize: "0.8125rem" }} onClick={() => setDrawer(l.id)}>
                        Timeline
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {drawer && (
            <aside className="card" style={{ position: "sticky", top: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong>Message timeline</strong>
                <button type="button" className="btn btn-ghost" style={{ padding: "0.25rem 0.5rem" }} onClick={() => setDrawer(null)}>
                  Close
                </button>
              </div>
              <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "70vh", overflow: "auto" }}>
                {messages.length === 0 ? (
                  <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>No messages yet.</p>
                ) : (
                  messages.map((m) => (
                    <div key={m.id} style={{ borderLeft: "3px solid var(--accent)", paddingLeft: "0.75rem" }}>
                      <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                        {m.direction} · {m.createdAt ? new Date(m.createdAt).toLocaleString() : ""}
                      </div>
                      <div style={{ fontSize: "0.875rem", whiteSpace: "pre-wrap" }}>{m.body.slice(0, 400)}</div>
                    </div>
                  ))
                )}
              </div>
            </aside>
          )}
        </div>
      )}
    </div>
  );
}
