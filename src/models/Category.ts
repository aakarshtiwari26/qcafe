import { Schema, model, models, type Model, type Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: { url: string; fileId: string };
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 500 },
    image: {
      url: { type: String },
      fileId: { type: String },
    },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

categorySchema.index({ sortOrder: 1 });
categorySchema.index({ isActive: 1 });

export const Category: Model<ICategory> =
  models.Category || model<ICategory>("Category", categorySchema);
