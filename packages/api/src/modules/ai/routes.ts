import { Router } from "express";
import { z } from "zod";
import { AiChatBodySchema, GenerateMessageBodySchema, SuggestIcpBodySchema } from "@growtix/shared-types";
import { requireAuth } from "../../middlewares/auth.js";
import { Lead, Message } from "../../models/index.js";
import { chatComplete } from "../../lib/openai.js";
import { enqueueJob } from "../../lib/queue.js";

export const aiRouter = Router();

/** Public chatbot (rate-limit in production); optional auth below */
aiRouter.post("/chat", async (req, res, next) => {
  try {
    AiChatBodySchema.parse(req.body);
    const body = req.body as z.infer<typeof AiChatBodySchema>;
    const system =
      "You are a helpful assistant on a lead generation SaaS marketing site. Keep answers short and suggest booking a demo.";
    const reply = await chatComplete(system, body.message);
    res.json({ reply, sessionId: body.sessionId ?? "anon" });
  } catch (e) {
    next(e);
  }
});

aiRouter.use(requireAuth);

aiRouter.post("/generate-message", async (req, res, next) => {
  try {
    const body = GenerateMessageBodySchema.parse(req.body);
    const lead = await Lead.findOne({ _id: body.leadId, orgId: req.auth!.orgId }).lean();
    if (!lead) {
      res.status(404).json({ error: "Lead not found" });
      return;
    }
    const ctx = JSON.stringify({
      firstName: lead.firstName,
      company: lead.company,
      title: lead.title,
      score: lead.score,
    });
    const system =
      "You are a B2B SDR. Write a concise, compliant cold email subject and body as JSON: {\"subject\":\"...\",\"body\":\"...\"}";
    const text = await chatComplete(system, `Prospect context: ${ctx}. Tone: ${body.tone ?? "professional"}`);
    let subject = "Quick question";
    let emailBody = text;
    try {
      const j = JSON.parse(text) as { subject?: string; body?: string };
      if (j.subject) subject = j.subject;
      if (j.body) emailBody = j.body;
    } catch {
      /* use raw */
    }
    const msg = await Message.create({
      orgId: req.auth!.orgId,
      leadId: lead._id,
      campaignId: body.campaignId,
      channel: "email",
      direction: "outbound",
      subject,
      body: emailBody,
      metadata: { aiGenerated: true },
      events: [{ type: "sent", at: new Date() }],
    });
    res.status(201).json({
      messageId: String(msg._id),
      subject,
      body: emailBody,
    });
  } catch (e) {
    next(e);
  }
});

aiRouter.post("/suggest-icp", async (req, res, next) => {
  try {
    const body = SuggestIcpBodySchema.parse(req.body);
    const system =
      "From the business description, propose an ICP as JSON with keys: industries (string[]), locations (string[]), keywords (string[]), companySize: {min,max}.";
    const text = await chatComplete(system, body.description);
    try {
      const icp = JSON.parse(text) as Record<string, unknown>;
      res.json({ icp });
    } catch {
      res.json({ icp: { industries: [], locations: [], keywords: [], raw: text } });
    }
  } catch (e) {
    next(e);
  }
});

aiRouter.post("/insights", async (req, res, next) => {
  try {
    await enqueueJob("aggregate_analytics", { orgId: req.auth!.orgId });
    const system =
      "Given KPI snapshot JSON, return 3 bullet insights for the sales team as plain text lines starting with '- '.";
    const snapshot = {
      orgId: req.auth!.orgId,
      note: "stub snapshot — connect BI for production",
    };
    const insightText = await chatComplete(system, JSON.stringify(snapshot));
    const bullets = insightText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    res.json({ insights: bullets.slice(0, 5) });
  } catch (e) {
    next(e);
  }
});
