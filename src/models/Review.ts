import { Schema, model, models, type Model, type Document } from "mongoose";

export interface IReview extends Document {
  customerName: string;
  detail?: string;
  quote: string;
  rating: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    customerName: { type: String, required: true, trim: true, maxlength: 100 },
    detail: { type: String, trim: true, maxlength: 150 },
    quote: { type: String, required: true, trim: true, maxlength: 500 },
    rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

reviewSchema.index({ isActive: 1, sortOrder: 1 });

export const Review: Model<IReview> = models.Review || model<IReview>("Review", reviewSchema);
