import { useEffect, useState, type FormEvent } from "react";
import { api } from "@/lib/api";

type Campaign = {
  id: string;
  name: string;
  status: string;
  icp?: { industries?: string[]; keywords?: string[] };
};

export function CampaignsPage() {
  const [items, setItems] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");

  async function refresh() {
    const res = await api<{ items: Campaign[] }>("/campaigns");
    setItems(res.items);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refresh();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function createCampaign(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await api("/campaigns", { method: "POST", body: JSON.stringify({ name: name.trim() }) });
    setName("");
    await refresh();
  }

  async function start(id: string) {
    await api(`/campaigns/${id}/start`, { method: "POST" });
    await refresh();
  }

  return (
    <div>
      <h1 className="display" style={{ fontSize: "2rem", marginTop: 0 }}>
        Campaigns
      </h1>
      <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
        Start a campaign to enqueue discovery jobs (stub leads in local dev). Edit ICP via API or future UI form.
      </p>

      <form onSubmit={createCampaign} className="card" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center", marginBottom: "1.5rem" }}>
        <input
          placeholder="New campaign name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            flex: "1 1 220px",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "0.6rem 0.75rem",
            background: "var(--bg)",
            color: "var(--text)",
          }}
        />
        <button type="submit" className="btn btn-primary">
          Create
        </button>
      </form>

      {loading ? (
        <p style={{ color: "var(--muted)" }}>Loading…</p>
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>ICP hints</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.status}</td>
                  <td style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>
                    {(c.icp?.industries ?? []).join(", ") || "—"} {(c.icp?.keywords ?? []).join(" ")}
                  </td>
                  <td>
                    {c.status !== "active" && (
                      <button type="button" className="btn btn-ghost" style={{ padding: "0.35rem 0.75rem", fontSize: "0.8125rem" }} onClick={() => start(c.id)}>
                        Start
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
