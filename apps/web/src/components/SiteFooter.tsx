import { Link } from "react-router-dom";

export function SiteFooter() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", marginTop: "4rem", padding: "3rem 0" }}>
      <div className="container" style={{ display: "grid", gap: "2rem", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
        <div>
          <div style={{ fontFamily: "Instrument Serif, serif", fontSize: "1.25rem", marginBottom: "0.5rem" }}>Growtix</div>
          <p style={{ color: "var(--muted)", fontSize: "0.875rem", margin: 0 }}>
            AI-powered lead generation and outreach for modern revenue teams.
          </p>
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Product</div>
          <Link to="/services" style={{ display: "block", color: "var(--muted)", fontSize: "0.875rem" }}>
            Services
          </Link>
          <Link to="/case-studies" style={{ display: "block", color: "var(--muted)", fontSize: "0.875rem", marginTop: "0.35rem" }}>
            Case studies
          </Link>
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Company</div>
          <Link to="/book" style={{ display: "block", color: "var(--muted)", fontSize: "0.875rem" }}>
            Book a call
          </Link>
        </div>
      </div>
      <div className="container" style={{ marginTop: "2rem", color: "var(--muted)", fontSize: "0.8125rem" }}>
        © {new Date().getFullYear()} Growtix. Demo application.
      </div>
    </footer>
  );
}
