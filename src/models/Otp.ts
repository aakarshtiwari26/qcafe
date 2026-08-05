import { Schema, model, models, type Model, type Document } from "mongoose";
import { OTP_PURPOSE, type OtpPurpose } from "@/constants";

export interface IOtp extends Document {
  email: string;
  purpose: OtpPurpose;
  codeHash: string;
  newEmail?: string;
  newPhone?: string;
  attempts: number;
  consumedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
}

const otpSchema = new Schema<IOtp>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    purpose: { type: String, enum: Object.values(OTP_PURPOSE), required: true },
    codeHash: { type: String, required: true },
    newEmail: { type: String, lowercase: true, trim: true },
    newPhone: { type: String, trim: true },
    attempts: { type: Number, default: 0 },
    consumedAt: { type: Date },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ email: 1, purpose: 1, createdAt: -1 });

export const Otp: Model<IOtp> = models.Otp || model<IOtp>("Otp", otpSchema);
