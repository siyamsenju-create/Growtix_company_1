import { Router } from "express";
import { z } from "zod";
import { GenerateMessageBodySchema } from "@growtix/shared-types";
import { requireAuth } from "../../middlewares/auth.js";
import { Message, Lead } from "../../models/index.js";
import { enqueueJob } from "../../lib/queue.js";

export const messagesRouter = Router();
messagesRouter.use(requireAuth);

messagesRouter.post("/preview", async (req, res, next) => {
  try {
    const body = GenerateMessageBodySchema.parse(req.body);
    const lead = await Lead.findOne({ _id: body.leadId, orgId: req.auth!.orgId }).lean();
    if (!lead) {
      res.status(404).json({ error: "Lead not found" });
      return;
    }
    await enqueueJob("generate_message", {
      orgId: req.auth!.orgId,
      leadId: body.leadId,
      campaignId: body.campaignId,
      metadata: { previewOnly: true },
    });
    res.json({
      queued: true,
      note: "Worker will persist draft when OPENAI_API_KEY is set; otherwise stub text returned via next poll or implement sync endpoint.",
    });
  } catch (e) {
    next(e);
  }
});

messagesRouter.post("/send-test", async (req, res, next) => {
  try {
    const body = z
      .object({
        leadId: z.string(),
        campaignId: z.string().optional(),
        subject: z.string(),
        body: z.string(),
      })
      .parse(req.body);
    const lead = await Lead.findOne({ _id: body.leadId, orgId: req.auth!.orgId });
    if (!lead) {
      res.status(404).json({ error: "Lead not found" });
      return;
    }
    const msg = await Message.create({
      orgId: req.auth!.orgId,
      leadId: lead._id,
      campaignId: body.campaignId,
      channel: "email",
      direction: "outbound",
      subject: body.subject,
      body: body.body,
      events: [{ type: "sent", at: new Date() }],
    });
    await enqueueJob("send_email", {
      orgId: req.auth!.orgId,
      leadId: body.leadId,
      campaignId: body.campaignId,
      metadata: { messageId: String(msg._id) },
    });
    res.status(201).json({ id: String(msg._id), queued: true });
  } catch (e) {
    next(e);
  }
});
