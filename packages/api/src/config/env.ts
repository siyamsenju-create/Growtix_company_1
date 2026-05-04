import "dotenv/config";

function req(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  mongodbUri: req("MONGODB_URI", "mongodb://localhost:27017/growtix"),
  redisUrl: req("REDIS_URL", "redis://localhost:6379"),
  jwtSecret: req("JWT_SECRET", "dev-secret-change-in-production-min-32-chars!!"),
  jwtRefreshSecret: req("JWT_REFRESH_SECRET", "dev-refresh-secret-change-min-32-chars!!"),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  openaiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  sendgridWebhookSecret: process.env.SENDGRID_WEBHOOK_SECRET ?? "",
};
