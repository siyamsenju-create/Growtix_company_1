import { Router } from "express";
import { z } from "zod";
import { AutomationRuleSchema } from "@growtix/shared-types";
import { requireAuth } from "../../middlewares/auth.js";
import { AutomationRule } from "../../models/index.js";

const CreateRuleSchema = AutomationRuleSchema.omit({ _id: true, createdAt: true });

export const automationRouter = Router();
automationRouter.use(requireAuth);

automationRouter.get("/rules", async (req, res, next) => {
  try {
    const items = await AutomationRule.find({ orgId: req.auth!.orgId }).sort({ updatedAt: -1 }).lean();
    res.json({
      items: items.map((r) => ({
        id: String(r._id),
        name: r.name,
        trigger: r.trigger,
        conditions: r.conditions,
        actions: r.actions,
        enabled: r.enabled,
      })),
    });
  } catch (e) {
    next(e);
  }
});

automationRouter.post("/rules", async (req, res, next) => {
  try {
    const body = CreateRuleSchema.parse({ ...req.body, orgId: req.auth!.orgId });
    const r = await AutomationRule.create(body);
    res.status(201).json({
      id: String(r._id),
      name: r.name,
      trigger: r.trigger,
      conditions: r.conditions,
      actions: r.actions,
      enabled: r.enabled,
    });
  } catch (e) {
    next(e);
  }
});

automationRouter.patch("/rules/:id", async (req, res, next) => {
  try {
    const patch = z
      .object({
        name: z.string().optional(),
        enabled: z.boolean().optional(),
        conditions: CreateRuleSchema.shape.conditions.optional(),
        actions: z.array(z.any()).optional(),
      })
      .parse(req.body);
    const r = await AutomationRule.findOneAndUpdate(
      { _id: req.params.id, orgId: req.auth!.orgId },
      { $set: patch },
      { new: true }
    ).lean();
    if (!r) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({
      id: String(r._id),
      name: r.name,
      trigger: r.trigger,
      conditions: r.conditions,
      actions: r.actions,
      enabled: r.enabled,
    });
  } catch (e) {
    next(e);
  }
});
