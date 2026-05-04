import { z } from "zod";

export const UserRoleSchema = z.enum(["client", "admin"]);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const IcpSchema = z.object({
  industries: z.array(z.string()).default([]),
  locations: z.array(z.string()).default([]),
  companySize: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
    })
    .optional(),
  keywords: z.array(z.string()).default([]),
  exclusions: z.array(z.string()).default([]),
});
export type Icp = z.infer<typeof IcpSchema>;

export const OrganizationSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1),
  plan: z.enum(["free", "pro", "enterprise"]).default("free"),
  billing: z.record(z.unknown()).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});
export type Organization = z.infer<typeof OrganizationSchema>;

export const UserSchema = z.object({
  _id: z.string().optional(),
  email: z.string().email(),
  passwordHash: z.string().optional(),
  role: UserRoleSchema.default("client"),
  orgId: z.string(),
  settings: z.record(z.unknown()).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});
export type User = z.infer<typeof UserSchema>;

export const LeadStatusSchema = z.enum([
  "new",
  "enriched",
  "scored",
  "contacted",
  "replied",
  "meeting_booked",
  "unsubscribed",
  "lost",
]);
export type LeadStatus = z.infer<typeof LeadStatusSchema>;

export const LeadSchema = z.object({
  _id: z.string().optional(),
  orgId: z.string(),
  campaignId: z.string().optional(),
  ownerId: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  title: z.string().optional(),
  status: LeadStatusSchema.default("new"),
  score: z.number().min(0).max(100).optional(),
  scoreReasons: z.array(z.string()).optional(),
  source: z.string().optional(),
  enrichment: z.record(z.unknown()).optional(),
  compliance: z
    .object({
      consentBasis: z.string().optional(),
      region: z.string().optional(),
      unsubscribedAt: z.coerce.date().optional(),
    })
    .optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});
export type Lead = z.infer<typeof LeadSchema>;

export const CampaignStatusSchema = z.enum(["draft", "active", "paused", "completed"]);
export type CampaignStatus = z.infer<typeof CampaignStatusSchema>;

export const CampaignSchema = z.object({
  _id: z.string().optional(),
  orgId: z.string(),
  name: z.string().min(1),
  status: CampaignStatusSchema.default("draft"),
  icp: IcpSchema.optional(),
  channels: z.array(z.enum(["email", "linkedin"])).default(["email"]),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});
export type Campaign = z.infer<typeof CampaignSchema>;

export const MessageChannelSchema = z.enum(["email", "linkedin", "chat"]);
export type MessageChannel = z.infer<typeof MessageChannelSchema>;

export const MessageEventSchema = z.object({
  type: z.enum(["sent", "delivered", "opened", "clicked", "replied", "bounced"]),
  at: z.coerce.date(),
  meta: z.record(z.unknown()).optional(),
});

export const MessageSchema = z.object({
  _id: z.string().optional(),
  orgId: z.string(),
  leadId: z.string(),
  campaignId: z.string().optional(),
  channel: MessageChannelSchema,
  direction: z.enum(["outbound", "inbound"]),
  subject: z.string().optional(),
  body: z.string(),
  metadata: z.record(z.unknown()).optional(),
  espMessageId: z.string().optional(),
  events: z.array(MessageEventSchema).default([]),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});
export type Message = z.infer<typeof MessageSchema>;

export const AnalyticsRollupSchema = z.object({
  _id: z.string().optional(),
  orgId: z.string(),
  campaignId: z.string().optional(),
  date: z.string(),
  sent: z.number().default(0),
  opens: z.number().default(0),
  replies: z.number().default(0),
  meetingsBooked: z.number().default(0),
  leadsCreated: z.number().default(0),
});
export type AnalyticsRollup = z.infer<typeof AnalyticsRollupSchema>;

export const AutomationTriggerSchema = z.enum([
  "lead.created",
  "lead.scored",
  "message.delivered",
  "message.replied",
  "meeting.booked",
  "campaign.status_changed",
  "crm.synced",
]);
export type AutomationTrigger = z.infer<typeof AutomationTriggerSchema>;

export const AutomationActionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("enqueue_job"), job: z.string(), payload: z.record(z.unknown()) }),
  z.object({ type: z.literal("update_lead_status"), status: LeadStatusSchema }),
  z.object({ type: z.literal("send_template"), templateId: z.string() }),
  z.object({ type: z.literal("book_meeting_link") }),
  z.object({ type: z.literal("stop_sequence") }),
  z.object({ type: z.literal("create_crm_task"), title: z.string() }),
]);

export const AutomationRuleSchema = z.object({
  _id: z.string().optional(),
  orgId: z.string(),
  name: z.string(),
  trigger: AutomationTriggerSchema,
  conditions: z
    .array(
      z.object({
        field: z.string(),
        op: z.enum(["eq", "gte", "lte", "contains"]),
        value: z.unknown(),
      })
    )
    .default([]),
  actions: z.array(AutomationActionSchema),
  enabled: z.boolean().default(true),
  createdAt: z.coerce.date().optional(),
});
export type AutomationRule = z.infer<typeof AutomationRuleSchema>;

export const AuditLogSchema = z.object({
  _id: z.string().optional(),
  orgId: z.string().optional(),
  actorId: z.string(),
  action: z.string(),
  resource: z.string().optional(),
  details: z.record(z.unknown()).optional(),
  createdAt: z.coerce.date().optional(),
});
export type AuditLog = z.infer<typeof AuditLogSchema>;

/* API request bodies */
export const RegisterBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  orgName: z.string().min(1),
});
export const LoginBodySchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const CreateLeadBodySchema = LeadSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
}).partial({ orgId: true });

export const PatchLeadBodySchema = CreateLeadBodySchema.partial();

export const CreateCampaignBodySchema = CampaignSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
}).partial({ orgId: true, status: true });

export const GenerateMessageBodySchema = z.object({
  leadId: z.string(),
  campaignId: z.string().optional(),
  tone: z.string().optional(),
});

export const AiChatBodySchema = z.object({
  message: z.string().min(1),
  sessionId: z.string().optional(),
});

export const SuggestIcpBodySchema = z.object({
  description: z.string().min(10),
});
