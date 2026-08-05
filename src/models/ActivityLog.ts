import { Schema, model, models, type Model, type Document, type Types } from "mongoose";
import { ACTIVITY_ACTION, type ActivityAction } from "@/constants";

export interface IActivityLog extends Document {
  actor?: Types.ObjectId;
  actorRole?: string;
  action: ActivityAction;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    actor: { type: Schema.Types.ObjectId, ref: "User" },
    actorRole: { type: String },
    action: { type: String, enum: Object.values(ACTIVITY_ACTION), required: true },
    targetType: { type: String },
    targetId: { type: String },
    metadata: { type: Schema.Types.Mixed },
    ip: { type: String },
    userAgent: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

activityLogSchema.index({ actor: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });

export const ActivityLog: Model<IActivityLog> =
  models.ActivityLog || model<IActivityLog>("ActivityLog", activityLogSchema);
