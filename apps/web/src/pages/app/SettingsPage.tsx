import { useState } from "react";
import { api } from "@/lib/api";

export function SettingsPage() {
  const [status, setStatus] = useState<string | null>(null);

  async function connectCrm(provider: "hubspot" | "salesforce" | "pipedrive") {
    setStatus(null);
    try {
      await api("/integrations/crm/connect", {
        method: "POST",
        body: JSON.stringify({ provider }),
      });
      setStatus(`Connected ${provider} (stub).`);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <div>
      <h1 className="display" style={{ fontSize: "2rem", marginTop: 0 }}>
        Settings
      </h1>
      <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>Integrations and workspace preferences.</p>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <h2 style={{ marginTop: 0, fontSize: "1.125rem" }}>CRM</h2>
        <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
          Connect your CRM for bi-directional sync. Tokens should be encrypted at rest in production.
        </p>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
          {(["hubspot", "salesforce", "pipedrive"] as const).map((p) => (
            <button key={p} type="button" className="btn btn-ghost" onClick={() => connectCrm(p)}>
              Connect {p}
            </button>
          ))}
        </div>
        {status && <p style={{ marginTop: "0.75rem", fontSize: "0.875rem" }}>{status}</p>}
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0, fontSize: "1.125rem" }}>Calendar</h2>
        <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
          Meeting booking links are triggered from automation rules when replies are detected.
        </p>
      </div>
    </div>
  );
}
