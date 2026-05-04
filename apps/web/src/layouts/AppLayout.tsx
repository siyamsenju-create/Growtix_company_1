import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { useTheme } from "@/theme/ThemeContext";

export function AppLayout({ admin }: { admin?: boolean }) {
  const { user, logout } = useAuth();
  const { mode, toggle } = useTheme();

  const baseNav = admin
    ? [{ to: "/admin", label: "Overview" }]
    : [
        { to: "/app/leads", label: "Leads" },
        { to: "/app/campaigns", label: "Campaigns" },
        { to: "/app/analytics", label: "Analytics" },
        { to: "/app/settings", label: "Settings" },
      ];
  const nav =
    user?.role === "admin" && !admin
      ? [...baseNav, { to: "/admin", label: "Admin" }]
      : baseNav;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "100vh" }}>
      <aside
        style={{
          borderRight: "1px solid var(--border)",
          padding: "1.25rem",
          background: "var(--surface)",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        <Link to="/" style={{ fontFamily: "Instrument Serif, serif", fontSize: "1.35rem", marginBottom: "1rem" }}>
          Growtix
        </Link>
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/admin"}
            style={({ isActive }) => ({
              padding: "0.5rem 0.75rem",
              borderRadius: 8,
              background: isActive ? "var(--surface-2)" : "transparent",
              fontWeight: isActive ? 600 : 500,
            })}
          >
            {item.label}
          </NavLink>
        ))}
        <div style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
          <div style={{ fontSize: "0.8125rem", color: "var(--muted)", marginBottom: "0.5rem" }}>{user?.email}</div>
          <button type="button" className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }} onClick={logout}>
            Log out
          </button>
          <button type="button" className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }} onClick={toggle}>
            {mode === "dark" ? "Light mode" : "Dark mode"}
          </button>
        </div>
      </aside>
      <main style={{ padding: "1.5rem 2rem", background: "var(--bg)" }}>
        <Outlet />
      </main>
    </div>
  );
}
