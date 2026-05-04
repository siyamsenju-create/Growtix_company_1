import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import { AnalyticsRollup, Lead, Message, Campaign } from "../../models/index.js";

export const analyticsRouter = Router();
analyticsRouter.use(requireAuth);

analyticsRouter.get("/overview", async (req, res, next) => {
  try {
    const orgId = req.auth!.orgId;
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const rollups = await AnalyticsRollup.find({ orgId }).sort({ date: -1 }).limit(90).lean();
    const leadCount = await Lead.countDocuments({ orgId });
    const campaignCount = await Campaign.countDocuments({ orgId });
    const recentMessages = await Message.countDocuments({
      orgId,
      createdAt: { $gte: since },
      direction: "outbound",
    });
    res.json({
      rollups: rollups.map((r) => ({
        date: r.date,
        campaignId: r.campaignId ? String(r.campaignId) : undefined,
        sent: r.sent,
        opens: r.opens,
        replies: r.replies,
        meetingsBooked: r.meetingsBooked,
        leadsCreated: r.leadsCreated,
      })),
      totals: {
        leads: leadCount,
        campaigns: campaignCount,
        outboundMessages30d: recentMessages,
      },
    });
  } catch (e) {
    next(e);
  }
});

analyticsRouter.get("/campaigns/:id", async (req, res, next) => {
  try {
    const campaign = await Campaign.findOne({ _id: req.params.id, orgId: req.auth!.orgId });
    if (!campaign) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    const rollups = await AnalyticsRollup.find({
      orgId: req.auth!.orgId,
      campaignId: campaign._id,
    })
      .sort({ date: -1 })
      .limit(90)
      .lean();
    res.json({
      campaignId: String(campaign._id),
      rollups: rollups.map((r) => ({
        date: r.date,
        sent: r.sent,
        opens: r.opens,
        replies: r.replies,
        meetingsBooked: r.meetingsBooked,
      })),
    });
  } catch (e) {
    next(e);
  }
});

analyticsRouter.get("/export", async (req, res, next) => {
  try {
    const orgId = req.auth!.orgId;
    const leads = await Lead.find({ orgId }).limit(10000).lean();
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=leads.csv");
    const header = "id,email,company,status,score\n";
    const rows = leads
      .map(
        (l) =>
          `${l._id},${l.email ?? ""},${(l.company ?? "").replace(/,/g, " ")},${l.status},${l.score ?? ""}`
      )
      .join("\n");
    res.send(header + rows);
  } catch (e) {
    next(e);
  }
});
