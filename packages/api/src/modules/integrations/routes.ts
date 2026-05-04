import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middlewares/auth.js";
import { Organization } from "../../models/index.js";
import { AuditLog } from "../../models/index.js";

export const integrationsRouter = Router();
integrationsRouter.use(requireAuth);

integrationsRouter.post("/crm/connect", async (req, res, next) => {
  try {
    const body = z
      .object({
        provider: z.enum(["hubspot", "salesforce", "pipedrive"]),
        apiKey: z.string().optional(),
      })
      .parse(req.body);
    await Organization.findByIdAndUpdate(req.auth!.orgId, {
      $set: { [`integrationRefs.${body.provider}`]: { connectedAt: new Date(), hasToken: Boolean(body.apiKey) } },
    });
    await AuditLog.create({
      orgId: req.auth!.orgId,
      actorId: req.auth!.sub,
      action: "crm.connect",
      resource: body.provider,
      details: { stub: true },
    });
    res.json({ ok: true, provider: body.provider, note: "Store tokens encrypted in production" });
  } catch (e) {
    next(e);
  }
});

integrationsRouter.post("/calendar/connect", async (req, res, next) => {
  try {
    const body = z.object({ provider: z.enum(["calcom", "calendly", "google"]) }).parse(req.body);
    res.json({ ok: true, provider: body.provider, embedUrl: "https://cal.com/demo" });
  } catch (e) {
    next(e);
  }
});
