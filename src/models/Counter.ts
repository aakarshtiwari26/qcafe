import { Schema, model, models, type Model, type Document } from "mongoose";

export interface ICounter extends Document {
  key: string;
  seq: number;
}

const counterSchema = new Schema<ICounter>({
  key: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});

export const Counter: Model<ICounter> = models.Counter || model<ICounter>("Counter", counterSchema);
