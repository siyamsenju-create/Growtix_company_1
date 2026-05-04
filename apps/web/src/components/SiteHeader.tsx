import { Link, NavLink } from "react-router-dom";
import { useTheme } from "@/theme/ThemeContext";
import { useAuth } from "@/auth/AuthContext";

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
  fontWeight: isActive ? 600 : 500,
  opacity: isActive ? 1 : 0.85,
});

export function SiteHeader() {
  const { mode, toggle } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header
      style={{
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBlock: "1rem",
          gap: "1rem",
        }}
      >
        <Link to="/" style={{ fontFamily: "Instrument Serif, serif", fontSize: "1.5rem" }}>
          Growtix
        </Link>
        <nav style={{ display: "flex", gap: "1.25rem", alignItems: "center", flexWrap: "wrap" }}>
          <NavLink to="/services" style={linkStyle}>
            Services
          </NavLink>
          <NavLink to="/case-studies" style={linkStyle}>
            Case studies
          </NavLink>
          <NavLink to="/book" style={linkStyle}>
            Book a call
          </NavLink>
          {user ? (
            <>
              <Link to="/app/leads" className="btn btn-primary" style={{ padding: "0.45rem 1rem", fontSize: "0.875rem" }}>
                Dashboard
              </Link>
              <button type="button" className="btn btn-ghost" style={{ padding: "0.45rem 1rem", fontSize: "0.875rem" }} onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost" style={{ padding: "0.45rem 1rem", fontSize: "0.875rem" }}>
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: "0.45rem 1rem", fontSize: "0.875rem" }}>
                Get started
              </Link>
            </>
          )}
          <button
            type="button"
            className="btn btn-ghost"
            style={{ padding: "0.45rem 0.85rem", fontSize: "0.8125rem" }}
            onClick={toggle}
            aria-label="Toggle color theme"
          >
            {mode === "dark" ? "Light" : "Dark"}
          </button>
        </nav>
      </div>
    </header>
  );
}
