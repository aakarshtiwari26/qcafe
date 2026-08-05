import { Schema, model, models, type Model, type Document, type Types } from "mongoose";

export interface IRefreshToken extends Document {
  user: Types.ObjectId;
  tokenHash: string;
  userAgent?: string;
  ip?: string;
  expiresAt: Date;
  revokedAt?: Date;
  createdAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tokenHash: { type: String, required: true, unique: true },
    userAgent: { type: String },
    ip: { type: String },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
refreshTokenSchema.index({ user: 1 });

export const RefreshToken: Model<IRefreshToken> =
  models.RefreshToken || model<IRefreshToken>("RefreshToken", refreshTokenSchema);
