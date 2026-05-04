import mongoose from "mongoose";

const { Schema } = mongoose;

const OrganizationSchema = new Schema(
  {
    name: { type: String, required: true },
    plan: { type: String, enum: ["free", "pro", "enterprise"], default: "free" },
    billing: { type: Schema.Types.Mixed },
    integrationRefs: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["client", "admin"], default: "client", index: true },
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    settings: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

const LeadSchema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    campaignId: { type: Schema.Types.ObjectId, ref: "Campaign", index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User" },
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    company: String,
    title: String,
    status: {
      type: String,
      enum: ["new", "enriched", "scored", "contacted", "replied", "meeting_booked", "unsubscribed", "lost"],
      default: "new",
      index: true,
    },
    score: { type: Number, min: 0, max: 100 },
    scoreReasons: [String],
    source: String,
    enrichment: { type: Schema.Types.Mixed },
    compliance: {
      consentBasis: String,
      region: String,
      unsubscribedAt: Date,
    },
  },
  { timestamps: true }
);
LeadSchema.index({ orgId: 1, campaignId: 1, status: 1 });

const CampaignSchema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    name: { type: String, required: true },
    status: {
      type: String,
      enum: ["draft", "active", "paused", "completed"],
      default: "draft",
      index: true,
    },
    icp: {
      industries: [String],
      locations: [String],
      companySize: { min: Number, max: Number },
      keywords: [String],
      exclusions: [String],
    },
    channels: [{ type: String, enum: ["email", "linkedin"] }],
    sequenceSteps: [
      {
        delayHours: { type: Number, default: 0 },
        subject: String,
        bodyTemplate: String,
      },
    ],
  },
  { timestamps: true }
);

const MessageSchema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true, index: true },
    campaignId: { type: Schema.Types.ObjectId, ref: "Campaign", index: true },
    channel: { type: String, enum: ["email", "linkedin", "chat"], required: true },
    direction: { type: String, enum: ["outbound", "inbound"], required: true },
    subject: String,
    body: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    espMessageId: { type: String, index: true },
    events: [
      {
        type: { type: String, enum: ["sent", "delivered", "opened", "clicked", "replied", "bounced"] },
        at: { type: Date, required: true },
        meta: { type: Schema.Types.Mixed },
      },
    ],
  },
  { timestamps: true }
);
MessageSchema.index({ leadId: 1, createdAt: -1 });

const AnalyticsSchema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    campaignId: { type: Schema.Types.ObjectId, ref: "Campaign", index: true },
    date: { type: String, required: true },
    sent: { type: Number, default: 0 },
    opens: { type: Number, default: 0 },
    replies: { type: Number, default: 0 },
    meetingsBooked: { type: Number, default: 0 },
    leadsCreated: { type: Number, default: 0 },
  },
  { timestamps: true }
);
AnalyticsSchema.index({ orgId: 1, campaignId: 1, date: 1 });

const AutomationRuleSchema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    name: { type: String, required: true },
    trigger: {
      type: String,
      enum: [
        "lead.created",
        "lead.scored",
        "message.delivered",
        "message.replied",
        "meeting.booked",
        "campaign.status_changed",
        "crm.synced",
      ],
      required: true,
    },
    conditions: [
      {
        field: String,
        op: { type: String, enum: ["eq", "gte", "lte", "contains"] },
        value: Schema.Types.Mixed,
      },
    ],
    actions: { type: [Schema.Types.Mixed], required: true },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const AuditLogSchema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", index: true },
    actorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    resource: String,
    details: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Organization = mongoose.model("Organization", OrganizationSchema);
export const User = mongoose.model("User", UserSchema);
export const Lead = mongoose.model("Lead", LeadSchema);
export const Campaign = mongoose.model("Campaign", CampaignSchema);
export const Message = mongoose.model("Message", MessageSchema);
export const AnalyticsRollup = mongoose.model("AnalyticsRollup", AnalyticsSchema);
export const AutomationRule = mongoose.model("AutomationRule", AutomationRuleSchema);
export const AuditLog = mongoose.model("AuditLog", AuditLogSchema);
