import type { JobPayload } from "./queue.js";
import { AutomationRule, Lead } from "../models/index.js";
import { enqueueJob } from "./queue.js";

export async function evaluateRulesForTrigger(
  orgId: string,
  trigger: string,
  context: { leadId?: string; score?: number }
): Promise<void> {
  if (orgId === "system") return;
  const rules = await AutomationRule.find({ orgId, enabled: true, trigger }).lean();
  for (const rule of rules) {
    const ok = (rule.conditions ?? []).every((c) =>
      c.field && c.op ? matchCondition({ field: c.field, op: c.op, value: c.value }, context) : true
    );
    if (!ok) continue;
    for (const action of rule.actions as Array<{ type: string; [k: string]: unknown }>) {
      if (action.type === "enqueue_job") {
        await enqueueJob(action.job as import("./queue.js").JobName, {
          orgId,
          leadId: context.leadId,
          metadata: (action.payload as Record<string, unknown>) ?? {},
        });
      }
      if (action.type === "update_lead_status" && context.leadId) {
        await Lead.findByIdAndUpdate(context.leadId, { $set: { status: action.status } });
      }
      if (action.type === "book_meeting_link" && context.leadId) {
        await Lead.findByIdAndUpdate(context.leadId, {
          $set: { status: "meeting_booked", enrichment: { meetingLinkSent: true } },
        });
      }
      if (action.type === "stop_sequence") {
        /* noop — would pause campaign lead sequence in full impl */
      }
    }
  }
}

function matchCondition(
  c: { field: string; op: string; value: unknown },
  context: { leadId?: string; score?: number }
): boolean {
  if (c.field === "score" && typeof context.score === "number") {
    if (c.op === "gte") return context.score >= Number(c.value);
    if (c.op === "lte") return context.score <= Number(c.value);
    if (c.op === "eq") return context.score === Number(c.value);
  }
  return true;
}

export async function handleAutomationJob(payload: JobPayload): Promise<void> {
  const trigger = (payload.metadata?.trigger as string) ?? "lead.created";
  const lead = payload.leadId ? await Lead.findById(payload.leadId).lean() : null;
  const score = lead?.score;
  await evaluateRulesForTrigger(payload.orgId, trigger, {
    leadId: payload.leadId,
    score: score === null || score === undefined ? undefined : score,
  });
}
