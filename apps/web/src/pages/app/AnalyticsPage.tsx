import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { api } from "@/lib/api";

type Rollup = {
  date: string;
  sent: number;
  opens: number;
  replies: number;
  meetingsBooked?: number;
};

export function AnalyticsPage() {
  const [rollups, setRollups] = useState<Rollup[]>([]);
  const [totals, setTotals] = useState<{ leads: number; campaigns: number; outboundMessages30d: number } | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const overview = await api<{ rollups: Rollup[]; totals: typeof totals }>("/analytics/overview");
        if (!cancelled) {
          setRollups(overview.rollups.slice().reverse());
          setTotals(overview.totals);
        }
        const ai = await api<{ insights: string[] }>("/ai/insights", { method: "POST", body: "{}" });
        if (!cancelled) setInsights(ai.insights);
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const chartData = rollups.map((r) => ({
    date: r.date,
    sent: r.sent,
    replies: r.replies,
    opens: r.opens,
  }));

  return (
    <div>
      <h1 className="display" style={{ fontSize: "2rem", marginTop: 0 }}>
        Analytics
      </h1>
      <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>Org-wide rollups and AI commentary.</p>

      {loading ? (
        <p style={{ color: "var(--muted)" }}>Loading…</p>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
            <div className="card">
              <div style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>Leads</div>
              <div style={{ fontSize: "1.75rem", fontWeight: 700 }}>{totals?.leads ?? 0}</div>
            </div>
            <div className="card">
              <div style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>Campaigns</div>
              <div style={{ fontSize: "1.75rem", fontWeight: 700 }}>{totals?.campaigns ?? 0}</div>
            </div>
            <div className="card">
              <div style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>Outbound (30d)</div>
              <div style={{ fontSize: "1.75rem", fontWeight: 700 }}>{totals?.outboundMessages30d ?? 0}</div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: "1.5rem", height: "320px" }}>
            <h2 style={{ marginTop: 0, fontSize: "1.125rem" }}>Sends & replies</h2>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fill: "var(--muted)", fontSize: 12 }} />
                <YAxis tick={{ fill: "var(--muted)", fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)" }} />
                <Legend />
                <Line type="monotone" dataKey="sent" stroke="#6366f1" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="replies" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h2 style={{ marginTop: 0, fontSize: "1.125rem" }}>AI insights</h2>
            <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "var(--muted)" }}>
              {insights.map((line, i) => (
                <li key={i} style={{ marginBottom: "0.35rem" }}>
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
