import { Link } from "react-router-dom";
import { CtaSection } from "@/components/CtaSection";

const cases = [
  {
    slug: "nimbus",
    title: "Nimbus Analytics",
    summary: "Expanded enterprise meetings by focusing AI scoring on high-intent titles.",
    metrics: ["+38% reply rate", "2.1× pipeline coverage"],
  },
  {
    slug: "brightfield",
    title: "Brightfield Health",
    summary: "Compliance-first sequences with regional suppression and CRM task automation.",
    metrics: ["−41% spam complaints", "CRM sync < 5 min lag"],
  },
];

export function CaseStudiesPage() {
  return (
    <main className="container" style={{ padding: "3rem 0 4rem" }}>
      <h1 className="display" style={{ fontSize: "2.75rem", marginBottom: "0.5rem" }}>
        Case studies
      </h1>
      <p style={{ color: "var(--muted)", maxWidth: "560px", marginBottom: "2rem" }}>
        Stories from teams pairing Growtix automation with tight ICP focus—numbers shown are illustrative for this demo UI.
      </p>
      <div style={{ display: "grid", gap: "1.25rem", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        {cases.map((c) => (
          <article key={c.slug} className="card">
            <h2 style={{ marginTop: 0, fontSize: "1.25rem" }}>{c.title}</h2>
            <p style={{ color: "var(--muted)" }}>{c.summary}</p>
            <ul style={{ paddingLeft: "1.1rem", color: "var(--text)" }}>
              {c.metrics.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
            <Link to="/book" style={{ color: "var(--accent)", fontWeight: 600 }}>
              Talk to us about similar results
            </Link>
          </article>
        ))}
      </div>
      <div style={{ marginTop: "3rem" }}>
        <CtaSection />
      </div>
    </main>
  );
}
