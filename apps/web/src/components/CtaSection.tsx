import { Link } from "react-router-dom";

export function CtaSection() {
  return (
    <section style={{ padding: "4rem 0", background: "linear-gradient(135deg, var(--surface-2), var(--bg))" }}>
      <div className="container card" style={{ textAlign: "center", padding: "2.5rem" }}>
        <h2 className="display" style={{ fontSize: "2.25rem", margin: "0 0 0.75rem" }}>
          Ready to fill your pipeline?
        </h2>
        <p style={{ color: "var(--muted)", maxWidth: "520px", margin: "0 auto 1.5rem" }}>
          Book a strategy call and we will map your ICP, channels, and automation sequence.
        </p>
        <Link to="/book" className="btn btn-primary">
          Book a call
        </Link>
      </div>
    </section>
  );
}
