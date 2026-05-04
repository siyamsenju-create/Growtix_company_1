import { Link } from "react-router-dom";
import { CtaSection } from "@/components/CtaSection";

export function HomePage() {
  return (
    <main>
      <section className="container" style={{ padding: "4rem 0 3rem", textAlign: "center" }}>
        <p style={{ color: "var(--accent)", fontWeight: 600, letterSpacing: "0.08em", fontSize: "0.8125rem", textTransform: "uppercase" }}>
          AI lead generation
        </p>
        <h1 className="display" style={{ fontSize: "clamp(2.5rem, 5vw, 3.75rem)", lineHeight: 1.1, margin: "0.75rem 0" }}>
          Predictable pipeline from AI-qualified leads
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "1.125rem", maxWidth: "560px", margin: "0 auto 1.75rem" }}>
          Define your ICP once. We discover prospects, enrich contacts, score intent, and automate compliant outreach—so your reps talk to buyers ready to buy.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/book" className="btn btn-primary">
            Book a call
          </Link>
          <a href="#how" className="btn btn-ghost">
            See how it works
          </a>
        </div>
      </section>

      <section className="container" style={{ padding: "2rem 0" }}>
        <p style={{ textAlign: "center", color: "var(--muted)", fontSize: "0.875rem" }}>
          Trusted by revenue teams who need pipeline consistency (demo logos)
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "2rem",
            flexWrap: "wrap",
            marginTop: "1rem",
            opacity: 0.75,
            fontWeight: 600,
          }}
        >
          {["Nimbus", "Northwind", "Acme Labs", "Brightfield"].map((name) => (
            <span key={name}>{name}</span>
          ))}
        </div>
      </section>

      <section className="container" style={{ padding: "3rem 0" }}>
        <h2 className="display" style={{ fontSize: "2rem", textAlign: "center", marginBottom: "2rem" }}>
          The problem
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
          {[
            {
              title: "Stale lists",
              body: "Static spreadsheets miss job changes, tech stacks, and timing signals.",
            },
            {
              title: "Low reply rates",
              body: "Generic outreach burns domains and burns trust with busy buyers.",
            },
            {
              title: "Dark funnel",
              body: "Activity lives in silos—no single view of engagement or next best action.",
            },
          ].map((c) => (
            <div key={c.title} className="card">
              <h3 style={{ marginTop: 0 }}>{c.title}</h3>
              <p style={{ color: "var(--muted)", margin: 0 }}>{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: "var(--surface-2)", padding: "3rem 0" }}>
        <div className="container">
          <h2 className="display" style={{ fontSize: "2rem", textAlign: "center", marginBottom: "2rem" }}>
            The Growtix solution
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem" }}>
            {[
              {
                title: "ICP → discovery",
                body: "Campaign-grade targeting combines firmographics, keywords, and exclusions.",
              },
              {
                title: "Enrichment + scoring",
                body: "Waterfall enrichment plus AI scoring surfaces who to prioritize first.",
              },
              {
                title: "Automated sequences",
                body: "Personalized messages and tracked sends across email (LinkedIn-ready architecture).",
              },
            ].map((c) => (
              <div key={c.title} className="card">
                <h3 style={{ marginTop: 0 }}>{c.title}</h3>
                <p style={{ color: "var(--muted)", margin: 0 }}>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="container" style={{ padding: "3rem 0" }}>
        <h2 className="display" style={{ fontSize: "2rem", textAlign: "center", marginBottom: "2rem" }}>
          How it works
        </h2>
        <ol style={{ maxWidth: "640px", margin: "0 auto", padding: 0, listStyle: "none", counterReset: "step" }}>
          {[
            "Define your ICP and sequences.",
            "We discover and enrich leads automatically.",
            "AI scores fit and drafts outreach.",
            "Sequences send with tracking; replies trigger next steps.",
          ].map((text, i) => (
            <li
              key={text}
              style={{
                display: "flex",
                gap: "1rem",
                marginBottom: "1.25rem",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  width: "2rem",
                  height: "2rem",
                  borderRadius: "999px",
                  background: "var(--accent)",
                  color: "white",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                }}
              >
                {i + 1}
              </span>
              <span style={{ paddingTop: "0.2rem" }}>{text}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="container" style={{ padding: "2rem 0 3rem" }}>
        <h2 className="display" style={{ fontSize: "2rem", textAlign: "center", marginBottom: "2rem" }}>
          Case studies & proof
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
          {[
            { co: "SaaS — pipeline +42%", quote: "Meetings booked per rep doubled in 6 weeks." },
            { co: "Agency — reply rate 3.1×", quote: "Personalization at scale without more headcount." },
          ].map((c) => (
            <div key={c.co} className="card">
              <div style={{ fontWeight: 700 }}>{c.co}</div>
              <p style={{ color: "var(--muted)", fontStyle: "italic", margin: "0.75rem 0 0" }}>“{c.quote}”</p>
              <Link to="/case-studies" style={{ display: "inline-block", marginTop: "1rem", color: "var(--accent)", fontWeight: 600 }}>
                Read more
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="container" style={{ paddingBottom: "2rem" }}>
        <div className="card" style={{ padding: "2rem" }}>
          <h2 className="display" style={{ fontSize: "1.75rem", marginTop: 0 }}>
            FAQ
          </h2>
          <details style={{ marginBottom: "0.75rem" }}>
            <summary style={{ fontWeight: 600, cursor: "pointer" }}>Is cold outreach compliant?</summary>
            <p style={{ color: "var(--muted)" }}>
              We model consent, region, and suppression lists. Production deployments should include legal review for your jurisdictions.
            </p>
          </details>
          <details>
            <summary style={{ fontWeight: 600, cursor: "pointer" }}>Do you replace our CRM?</summary>
            <p style={{ color: "var(--muted)" }}>
              Growtix complements your CRM with adapters—sync leads, tasks, and meetings without ripping out your stack.
            </p>
          </details>
        </div>
      </section>

      <CtaSection />
    </main>
  );
}
