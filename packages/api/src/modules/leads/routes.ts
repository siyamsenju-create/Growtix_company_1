import { Router } from "express";
import { CreateLeadBodySchema, PatchLeadBodySchema } from "@growtix/shared-types";
import { requireAuth } from "../../middlewares/auth.js";
import { Lead, Message } from "../../models/index.js";
import { enqueueJob } from "../../lib/queue.js";

export const leadsRouter = Router();
leadsRouter.use(requireAuth);

leadsRouter.get("/", async (req, res, next) => {
  try {
    const orgId = req.auth!.orgId;
    const { status, campaignId, limit = "50", skip = "0" } = req.query;
    const q: Record<string, unknown> = { orgId };
    if (typeof status === "string") q.status = status;
    if (typeof campaignId === "string") q.campaignId = campaignId;
    const items = await Lead.find(q)
      .sort({ updatedAt: -1 })
      .skip(Number(skip))
      .limit(Math.min(Number(limit), 200))
      .lean();
    res.json({ items: items.map(serializeLead), total: await Lead.countDocuments(q) });
  } catch (e) {
    next(e);
  }
});

leadsRouter.post("/", async (req, res, next) => {
  try {
    const body = CreateLeadBodySchema.parse({ ...req.body, orgId: req.auth!.orgId });
    const lead = await Lead.create({
      ...body,
      orgId: req.auth!.orgId,
    });
    await enqueueJob("automation_evaluate", {
      orgId: req.auth!.orgId,
      leadId: String(lead._id),
      metadata: { trigger: "lead.created" },
    });
    res.status(201).json(serializeLead(lead.toObject()));
  } catch (e) {
    next(e);
  }
});

leadsRouter.get("/:id/messages", async (req, res, next) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, orgId: req.auth!.orgId });
    if (!lead) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    const items = await Message.find({ leadId: lead._id, orgId: req.auth!.orgId })
      .sort({ createdAt: -1 })
      .lean();
    res.json({
      items: items.map((m) => ({
        id: String(m._id),
        leadId: String(m.leadId),
        campaignId: m.campaignId ? String(m.campaignId) : undefined,
        channel: m.channel,
        direction: m.direction,
        subject: m.subject,
        body: m.body,
        events: m.events,
        createdAt: m.createdAt,
      })),
    });
  } catch (e) {
    next(e);
  }
});

leadsRouter.get("/:id", async (req, res, next) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, orgId: req.auth!.orgId }).lean();
    if (!lead) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(serializeLead(lead));
  } catch (e) {
    next(e);
  }
});

leadsRouter.patch("/:id", async (req, res, next) => {
  try {
    const body = PatchLeadBodySchema.parse(req.body);
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, orgId: req.auth!.orgId },
      { $set: body },
      { new: true }
    ).lean();
    if (!lead) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(serializeLead(lead));
  } catch (e) {
    next(e);
  }
});

leadsRouter.delete("/:id", async (req, res, next) => {
  try {
    const r = await Lead.deleteOne({ _id: req.params.id, orgId: req.auth!.orgId });
    if (r.deletedCount === 0) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

leadsRouter.post("/:id/enrich", async (req, res, next) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, orgId: req.auth!.orgId });
    if (!lead) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    await enqueueJob("enrich_lead", { orgId: req.auth!.orgId, leadId: String(lead._id) });
    res.json({ queued: true });
  } catch (e) {
    next(e);
  }
});

leadsRouter.post("/:id/score", async (req, res, next) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, orgId: req.auth!.orgId });
    if (!lead) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    await enqueueJob("score_lead", { orgId: req.auth!.orgId, leadId: String(lead._id) });
    res.json({ queued: true });
  } catch (e) {
    next(e);
  }
});

leadsRouter.post("/import", async (req, res, next) => {
  try {
    const rows = req.body?.rows as unknown[] | undefined;
    if (!Array.isArray(rows)) {
      res.status(400).json({ error: "Expected { rows: [...] }" });
      return;
    }
    for (const row of rows.slice(0, 500)) {
      const r = row as Record<string, string>;
      const lead = await Lead.create({
        orgId: req.auth!.orgId,
        email: r.email,
        firstName: r.firstName,
        lastName: r.lastName,
        company: r.company,
        source: "csv_import",
      });
      await enqueueJob("enrich_lead", { orgId: req.auth!.orgId, leadId: String(lead._id) });
    }
    res.json({ imported: Math.min(rows.length, 500) });
  } catch (e) {
    next(e);
  }
});

function serializeLead(doc: Record<string, unknown>) {
  return {
    id: String(doc._id),
    orgId: String(doc.orgId),
    campaignId: doc.campaignId ? String(doc.campaignId) : undefined,
    firstName: doc.firstName,
    lastName: doc.lastName,
    email: doc.email,
    phone: doc.phone,
    company: doc.company,
    title: doc.title,
    status: doc.status,
    score: doc.score,
    scoreReasons: doc.scoreReasons,
    source: doc.source,
    enrichment: doc.enrichment,
    compliance: doc.compliance,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
