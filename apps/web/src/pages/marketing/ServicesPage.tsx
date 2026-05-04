import { CtaSection } from "@/components/CtaSection";

export function ServicesPage() {
  return (
    <main className="container" style={{ padding: "3rem 0 4rem" }}>
      <h1 className="display" style={{ fontSize: "2.75rem", marginBottom: "0.5rem" }}>
        Services
      </h1>
      <p style={{ color: "var(--muted)", maxWidth: "640px", marginBottom: "2.5rem" }}>
        Everything you need to turn targeting into pipeline: discovery, enrichment, AI messaging, and analytics in one modular platform.
      </p>

      <section style={{ marginBottom: "2.5rem" }}>
        <h2 className="display" style={{ fontSize: "1.75rem" }}>
          AI lead generation
        </h2>
        <ul style={{ color: "var(--muted)", lineHeight: 1.7 }}>
          <li>ICP builder with industry, geo, company size, keywords, and exclusions.</li>
          <li>API-first discovery with deduplication and campaign attribution.</li>
          <li>Optional enrichment waterfall for email validation and firmographics.</li>
        </ul>
        <p style={{ fontWeight: 600 }}>Outcomes: higher qualified top-of-funnel volume without manual research.</p>
      </section>

      <section style={{ marginBottom: "2.5rem" }}>
        <h2 className="display" style={{ fontSize: "1.75rem" }}>
          Outreach automation
        </h2>
        <ul style={{ color: "var(--muted)", lineHeight: 1.7 }}>
          <li>AI-personalized sequences with guardrails and templates.</li>
          <li>ESP integration with delivery, open, and reply tracking.</li>
          <li>Automation rules for replies, scoring thresholds, and meeting links.</li>
        </ul>
        <p style={{ fontWeight: 600 }}>Outcomes: improved reply rates and domain reputation through relevance.</p>
      </section>

      <section style={{ marginBottom: "2.5rem" }}>
        <h2 className="display" style={{ fontSize: "1.75rem" }}>
          CRM & analytics
        </h2>
        <ul style={{ color: "var(--muted)", lineHeight: 1.7 }}>
          <li>Rollup analytics by day and campaign—sends, opens, replies, meetings.</li>
          <li>CRM connectors (stubbed) for tasks and contact sync.</li>
          <li>Export and audit trails for governance.</li>
        </ul>
        <p style={{ fontWeight: 600 }}>Outcomes: leadership-grade visibility into what drives pipeline.</p>
      </section>

      <CtaSection />
    </main>
  );
}
