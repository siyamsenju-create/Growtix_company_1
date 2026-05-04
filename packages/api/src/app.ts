import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/error.js";
import { authRouter } from "./modules/auth/routes.js";
import { leadsRouter } from "./modules/leads/routes.js";
import { campaignsRouter } from "./modules/campaigns/routes.js";
import { messagesRouter } from "./modules/messages/routes.js";
import { analyticsRouter } from "./modules/analytics/routes.js";
import { aiRouter } from "./modules/ai/routes.js";
import { automationRouter } from "./modules/automation/routes.js";
import { integrationsRouter } from "./modules/integrations/routes.js";
import { webhooksRouter } from "./modules/webhooks/routes.js";
import { adminRouter } from "./modules/admin/routes.js";

export function createApp(): express.Express {
  const app = express();
  app.use(
    cors({
      origin: env.corsOrigin.split(",").map((s) => s.trim()),
      credentials: true,
    })
  );
  app.use(express.json({ limit: "2mb" }));

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/auth", authRouter);
  app.use("/leads", leadsRouter);
  app.use("/campaigns", campaignsRouter);
  app.use("/messages", messagesRouter);
  app.use("/analytics", analyticsRouter);
  app.use("/ai", aiRouter);
  app.use("/automation", automationRouter);
  app.use("/integrations", integrationsRouter);
  app.use("/webhooks", webhooksRouter);
  app.use("/admin", adminRouter);

  app.use(errorHandler);
  return app;
}
