import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireAdmin } from "../../middlewares/auth.js";
import { User, Organization, Campaign, AuditLog } from "../../models/index.js";

export const adminRouter = Router();
adminRouter.use(requireAuth);
adminRouter.use(requireAdmin);

adminRouter.get("/users", async (_req, res, next) => {
  try {
    const users = await User.find().limit(200).lean();
    res.json({
      items: users.map((u) => ({
        id: String(u._id),
        email: u.email,
        role: u.role,
        orgId: String(u.orgId),
      })),
    });
  } catch (e) {
    next(e);
  }
});

adminRouter.patch("/users/:id", async (req, res, next) => {
  try {
    const body = z.object({ role: z.enum(["client", "admin"]).optional() }).parse(req.body);
    const u = await User.findByIdAndUpdate(req.params.id, { $set: body }, { new: true }).lean();
    if (!u) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    await AuditLog.create({
      actorId: req.auth!.sub,
      action: "admin.user.patch",
      resource: String(u._id),
      details: body,
    });
    res.json({ id: String(u._id), email: u.email, role: u.role });
  } catch (e) {
    next(e);
  }
});

adminRouter.get("/campaigns", async (_req, res, next) => {
  try {
    const items = await Campaign.find().sort({ updatedAt: -1 }).limit(200).lean();
    res.json({
      items: items.map((c) => ({
        id: String(c._id),
        orgId: String(c.orgId),
        name: c.name,
        status: c.status,
      })),
    });
  } catch (e) {
    next(e);
  }
});

adminRouter.get("/organizations", async (_req, res, next) => {
  try {
    const items = await Organization.find().limit(200).lean();
    res.json({
      items: items.map((o) => ({
        id: String(o._id),
        name: o.name,
        plan: o.plan,
      })),
    });
  } catch (e) {
    next(e);
  }
});

adminRouter.get("/audit", async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(limit).lean();
    res.json({
      items: logs.map((l) => ({
        id: String(l._id),
        actorId: String(l.actorId),
        action: l.action,
        resource: l.resource,
        details: l.details,
        createdAt: l.createdAt,
      })),
    });
  } catch (e) {
    next(e);
  }
});
