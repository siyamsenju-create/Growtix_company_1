import { Router } from "express";
import { Message } from "../../models/index.js";
import { enqueueJob } from "../../lib/queue.js";

export const webhooksRouter = Router();

webhooksRouter.post("/esp/:provider", async (req, res, next) => {
  try {
    const provider = req.params.provider;
    await enqueueJob("webhook_process", {
      orgId: "system",
      provider,
      rawBody: JSON.stringify(req.body),
      metadata: { headers: req.headers },
    });
    res.status(202).json({ received: true });
  } catch (e) {
    next(e);
  }
});

webhooksRouter.post("/calendar", async (req, res, next) => {
  try {
    await enqueueJob("webhook_process", {
      orgId: "system",
      provider: "calendar",
      rawBody: JSON.stringify(req.body),
    });
    res.status(202).json({ received: true });
  } catch (e) {
    next(e);
  }
});

/** Internal helper used by workers when ESP resolves org + message */
export async function appendMessageEvent(
  espMessageId: string,
  type: "delivered" | "opened" | "clicked" | "replied" | "bounced",
  orgId: string
): Promise<void> {
  await Message.findOneAndUpdate(
    { espMessageId, orgId },
    { $push: { events: { type, at: new Date() } } }
  );
  await enqueueJob("automation_evaluate", {
    orgId,
    metadata: { trigger: `message.${type === "replied" ? "replied" : "delivered"}` },
  });
}
