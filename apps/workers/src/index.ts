import "dotenv/config";
import { Worker } from "bullmq";
import { Redis } from "ioredis";
import { connectDb } from "@growtix/api/lib/db.js";
import { QUEUE_NAME, type JobPayload } from "@growtix/api/lib/queue.js";
import { Lead, Campaign, Message, AnalyticsRollup } from "@growtix/api/models/index.js";
import { chatComplete } from "@growtix/api/lib/openai.js";
import { handleAutomationJob } from "@growtix/api/lib/automation-engine.js";
import { env } from "@growtix/api/config/env.js";

const connection = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

async function processJob(name: string, payload: JobPayload): Promise<void> {
  switch (name) {
    case "enrich_lead":
      await enrichLead(payload);
      break;
    case "score_lead":
      await scoreLead(payload);
      break;
    case "generate_message":
      await generateMessage(payload);
      break;
    case "send_email":
      await sendEmailStub(payload);
      break;
    case "aggregate_analytics":
      await aggregateAnalytics(payload);
      break;
    case "webhook_process":
      console.log("[webhook_process]", payload.provider, payload.rawBody?.slice(0, 200));
      break;
    case "discover_leads":
      await discoverLeads(payload);
      break;
    case "automation_evaluate":
      await handleAutomationJob(payload);
      break;
    case "send_linkedin":
    case "sync_crm":
      console.log(`[${name}] stub`, payload);
      break;
    default:
      console.warn("Unknown job", name);
  }
}

async function enrichLead(payload: JobPayload): Promise<void> {
  if (!payload.leadId) return;
  const lead = await Lead.findOne({ _id: payload.leadId, orgId: payload.orgId });
  if (!lead) return;
  lead.enrichment = {
    ...(lead.enrichment as object),
    emailStatus: "verified_stub",
    companySize: "51-200",
    linkedinUrl: "https://linkedin.com/in/example",
  };
  lead.status = "enriched";
  await lead.save();
}

async function scoreLead(payload: JobPayload): Promise<void> {
  if (!payload.leadId) return;
  const lead = await Lead.findOne({ _id: payload.leadId, orgId: payload.orgId });
  if (!lead) return;
  const system =
    "Return JSON only: {\"score\": number from 0-100, \"reasons\": string[] } based on fit for B2B SaaS outreach.";
  const user = `Company: ${lead.company}, Title: ${lead.title}, Industry signals: ${JSON.stringify(lead.enrichment)}`;
  const text = await chatComplete(system, user);
  let score = 50;
  let reasons: string[] = ["baseline"];
  try {
    const j = JSON.parse(text) as { score?: number; reasons?: string[] };
    if (typeof j.score === "number") score = j.score;
    if (Array.isArray(j.reasons)) reasons = j.reasons;
  } catch {
    score = lead.company ? 62 : 40;
    reasons = ["heuristic fallback"];
  }
  lead.score = Math.min(100, Math.max(0, score));
  lead.scoreReasons = reasons;
  lead.status = "scored";
  await lead.save();
}

async function generateMessage(payload: JobPayload): Promise<void> {
  if (!payload.leadId) return;
  const lead = await Lead.findOne({ _id: payload.leadId, orgId: payload.orgId });
  if (!lead) return;
  const system =
    "Write JSON {\"subject\":\"...\",\"body\":\"...\"} for a short outbound email.";
  const text = await chatComplete(system, `Prospect: ${lead.firstName} at ${lead.company}`);
  let subject = "Hello";
  let body = text;
  try {
    const j = JSON.parse(text) as { subject?: string; body?: string };
    if (j.subject) subject = j.subject;
    if (j.body) body = j.body;
  } catch {
    body = text;
  }
  await Message.create({
    orgId: payload.orgId,
    leadId: lead._id,
    campaignId: payload.campaignId,
    channel: "email",
    direction: "outbound",
    subject,
    body,
    metadata: { aiGenerated: true, preview: Boolean(payload.metadata?.previewOnly) },
    events: [{ type: "sent", at: new Date() }],
  });
}

async function sendEmailStub(payload: JobPayload): Promise<void> {
  const msgId = payload.metadata?.messageId as string | undefined;
  if (msgId) {
    const msg = await Message.findOne({ _id: msgId, orgId: payload.orgId });
    if (msg) {
      msg.espMessageId = `stub_${msg._id}`;
      msg.events.push({ type: "delivered", at: new Date() });
      await msg.save();
    }
  }
  console.log("[send_email] stub — configure ESP for production", payload.leadId);
}

async function aggregateAnalytics(payload: JobPayload): Promise<void> {
  const date = new Date().toISOString().slice(0, 10);
  const orgId = payload.orgId;
  const campaignId = payload.campaignId;
  const sent = await Message.countDocuments({
    orgId,
    ...(campaignId ? { campaignId } : {}),
    direction: "outbound",
  });
  const replies = await Message.countDocuments({
    orgId,
    ...(campaignId ? { campaignId } : {}),
    "events.type": "replied",
  });
  await AnalyticsRollup.findOneAndUpdate(
    { orgId, date, ...(campaignId ? { campaignId } : {}) },
    { $set: { sent, replies, opens: Math.floor(sent * 0.25) } },
    { upsert: true }
  );
}

async function discoverLeads(payload: JobPayload): Promise<void> {
  if (!payload.campaignId) return;
  const campaign = await Campaign.findOne({ _id: payload.campaignId, orgId: payload.orgId });
  if (!campaign) return;
  const icp = campaign.icp;
  const samples = [
    { firstName: "Alex", lastName: "Rivera", email: "alex@exampleco.io", company: "ExampleCo", title: "VP Sales" },
    { firstName: "Sam", lastName: "Lee", email: "sam@acme.test", company: "Acme Labs", title: "Head of Growth" },
  ];
  const created: typeof samples = [];
  for (const s of samples) {
    if (icp?.keywords?.length) {
      const match = icp.keywords.some(
        (k) => s.company.toLowerCase().includes(k.toLowerCase()) || s.title.toLowerCase().includes(k.toLowerCase())
      );
      if (!match) continue;
    }
    created.push(s);
  }
  const toCreate = created.length > 0 ? created : [samples[0]];
  for (const s of toCreate) {
    const lead = await Lead.create({
      orgId: payload.orgId,
      campaignId: campaign._id,
      ...s,
      source: "discover_stub",
      status: "new",
    });
    await processJob("enrich_lead", { orgId: payload.orgId, leadId: String(lead._id) });
    await processJob("score_lead", { orgId: payload.orgId, leadId: String(lead._id) });
  }
}

async function main(): Promise<void> {
  await connectDb();
  console.log("Workers connected to MongoDB, OPENAI:", Boolean(env.openaiApiKey));

  new Worker(
    QUEUE_NAME,
    async (job) => {
      await processJob(job.name, job.data as JobPayload);
    },
    { connection }
  );

  console.log(`Worker subscribed to queue ${QUEUE_NAME}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
