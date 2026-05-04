import { Queue } from "bullmq";
import { getRedis } from "./redis.js";

export const QUEUE_NAME = "growtix-jobs";

export type JobName =
  | "enrich_lead"
  | "score_lead"
  | "generate_message"
  | "send_email"
  | "send_transactional"
  | "send_linkedin"
  | "sync_crm"
  | "aggregate_analytics"
  | "webhook_process"
  | "discover_leads"
  | "automation_evaluate";

export type TransactionalEmailMeta = {
  kind: "verify_email" | "password_reset";
  to: string;
  subject: string;
  text: string;
};

export type JobPayload = {
  orgId: string;
  leadId?: string;
  campaignId?: string;
  userId?: string;
  provider?: string;
  rawBody?: string;
  metadata?: Record<string, unknown> & { transactional?: TransactionalEmailMeta };
};

let queue: Queue<JobPayload> | null = null;

export function getJobQueue(): Queue<JobPayload> {
  if (!queue) {
    queue = new Queue<JobPayload>(QUEUE_NAME, {
      connection: getRedis(),
    });
  }
  return queue;
}

export async function enqueueJob(name: JobName, payload: JobPayload): Promise<void> {
  await getJobQueue().add(name, payload, { removeOnComplete: 1000, removeOnFail: 5000 });
}
