import { Router } from "express";
import { CreateCampaignBodySchema } from "@growtix/shared-types";
import { z } from "zod";
import { requireAuth } from "../../middlewares/auth.js";
import { Campaign } from "../../models/index.js";
import { enqueueJob } from "../../lib/queue.js";

const PatchCampaignSchema = CreateCampaignBodySchema.partial();

export const campaignsRouter = Router();
campaignsRouter.use(requireAuth);

campaignsRouter.get("/", async (req, res, next) => {
  try {
    const items = await Campaign.find({ orgId: req.auth!.orgId }).sort({ updatedAt: -1 }).lean();
    res.json({ items: items.map(serialize) });
  } catch (e) {
    next(e);
  }
});

campaignsRouter.post("/", async (req, res, next) => {
  try {
    const body = CreateCampaignBodySchema.parse({ ...req.body, orgId: req.auth!.orgId });
    const c = await Campaign.create({ ...body, orgId: req.auth!.orgId });
    res.status(201).json(serialize(c.toObject()));
  } catch (e) {
    next(e);
  }
});

campaignsRouter.get("/:id", async (req, res, next) => {
  try {
    const c = await Campaign.findOne({ _id: req.params.id, orgId: req.auth!.orgId }).lean();
    if (!c) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(serialize(c));
  } catch (e) {
    next(e);
  }
});

campaignsRouter.patch("/:id", async (req, res, next) => {
  try {
    const body = PatchCampaignSchema.parse(req.body);
    const c = await Campaign.findOneAndUpdate(
      { _id: req.params.id, orgId: req.auth!.orgId },
      { $set: body },
      { new: true }
    ).lean();
    if (!c) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(serialize(c));
  } catch (e) {
    next(e);
  }
});

campaignsRouter.delete("/:id", async (req, res, next) => {
  try {
    const r = await Campaign.deleteOne({ _id: req.params.id, orgId: req.auth!.orgId });
    if (r.deletedCount === 0) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

campaignsRouter.post("/:id/start", async (req, res, next) => {
  try {
    const c = await Campaign.findOneAndUpdate(
      { _id: req.params.id, orgId: req.auth!.orgId },
      { $set: { status: "active" } },
      { new: true }
    ).lean();
    if (!c) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    await enqueueJob("discover_leads", { orgId: req.auth!.orgId, campaignId: String(c._id) });
    await enqueueJob("aggregate_analytics", { orgId: req.auth!.orgId, campaignId: String(c._id) });
    res.json(serialize(c));
  } catch (e) {
    next(e);
  }
});

campaignsRouter.post("/:id/pause", async (req, res, next) => {
  try {
    const c = await Campaign.findOneAndUpdate(
      { _id: req.params.id, orgId: req.auth!.orgId },
      { $set: { status: "paused" } },
      { new: true }
    ).lean();
    if (!c) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(serialize(c));
  } catch (e) {
    next(e);
  }
});

campaignsRouter.post("/:id/icp", async (req, res, next) => {
  try {
    const icp = z
      .object({
        industries: z.array(z.string()).optional(),
        locations: z.array(z.string()).optional(),
        companySize: z.object({ min: z.number().optional(), max: z.number().optional() }).optional(),
        keywords: z.array(z.string()).optional(),
        exclusions: z.array(z.string()).optional(),
      })
      .parse(req.body);
    const c = await Campaign.findOneAndUpdate(
      { _id: req.params.id, orgId: req.auth!.orgId },
      { $set: { icp } },
      { new: true }
    ).lean();
    if (!c) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(serialize(c));
  } catch (e) {
    next(e);
  }
});

campaignsRouter.post("/:id/sequences", async (req, res, next) => {
  try {
    const steps = z.array(z.object({ delayHours: z.number(), subject: z.string(), bodyTemplate: z.string() })).parse(req.body?.steps ?? req.body);
    const c = await Campaign.findOneAndUpdate(
      { _id: req.params.id, orgId: req.auth!.orgId },
      { $set: { sequenceSteps: steps } },
      { new: true }
    ).lean();
    if (!c) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({ ok: true, campaignId: String(c._id), steps: steps.length });
  } catch (e) {
    next(e);
  }
});

function serialize(doc: Record<string, unknown>) {
  return {
    id: String(doc._id),
    orgId: String(doc.orgId),
    name: doc.name,
    status: doc.status,
    icp: doc.icp,
    channels: doc.channels,
    sequenceSteps: doc.sequenceSteps,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
