import { Schema, model, models, type Model, type Document } from "mongoose";

export interface IHostel extends Document {
  name: string;
  code: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const hostelSchema = new Schema<IHostel>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    code: { type: String, required: true, trim: true, uppercase: true, unique: true, maxlength: 20 },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

hostelSchema.index({ sortOrder: 1 });
hostelSchema.index({ isActive: 1 });

export const Hostel: Model<IHostel> = models.Hostel || model<IHostel>("Hostel", hostelSchema);
