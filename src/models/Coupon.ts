import { Schema, model, models, type Model, type Document } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  description?: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  validFrom: Date;
  validUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, maxlength: 30 },
    description: { type: String, maxlength: 200 },
    discountType: { type: String, enum: ["percentage", "flat"], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderValue: { type: Number, default: 0, min: 0 },
    maxDiscountAmount: { type: Number, min: 0 },
    usageLimit: { type: Number, min: 0 },
    usedCount: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
    validFrom: { type: Date, default: Date.now },
    validUntil: { type: Date },
  },
  { timestamps: true }
);

couponSchema.index({ isActive: 1 });

export const Coupon: Model<ICoupon> = models.Coupon || model<ICoupon>("Coupon", couponSchema);
