import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export function AdminPage() {
  const [users, setUsers] = useState<{ id: string; email: string; role: string }[]>([]);
  const [orgs, setOrgs] = useState<{ id: string; name: string; plan: string }[]>([]);
  const [campaigns, setCampaigns] = useState<{ id: string; name: string; orgId: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [u, o, c] = await Promise.all([
          api<{ items: typeof users }>("/admin/users"),
          api<{ items: typeof orgs }>("/admin/organizations"),
          api<{ items: typeof campaigns }>("/admin/campaigns"),
        ]);
        if (!cancelled) {
          setUsers(u.items);
          setOrgs(o.items);
          setCampaigns(c.items);
        }
      } catch {
        /* forbidden if not admin */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <h1 className="display" style={{ fontSize: "2rem", marginTop: 0 }}>
        Admin
      </h1>
      <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>Cross-tenant overview (requires admin role).</p>

      <h2 style={{ fontSize: "1.125rem" }}>Organizations</h2>
      <div className="table-wrap" style={{ marginBottom: "2rem" }}>
        <table className="data">
          <thead>
            <tr>
              <th>Name</th>
              <th>Plan</th>
            </tr>
          </thead>
          <tbody>
            {orgs.map((o) => (
              <tr key={o.id}>
                <td>{o.name}</td>
                <td>{o.plan}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={{ fontSize: "1.125rem" }}>Users</h2>
      <div className="table-wrap" style={{ marginBottom: "2rem" }}>
        <table className="data">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={{ fontSize: "1.125rem" }}>Campaigns</h2>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Name</th>
              <th>Org</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>{c.orgId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
