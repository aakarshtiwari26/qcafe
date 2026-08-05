import { Schema, model, models, type Model, type Document } from "mongoose";

export interface IRestaurantSettings extends Document {
  key: "main";
  name: string;
  tagline: string;
  logo?: { url: string; fileId: string };
  banner?: { url: string; fileId: string };
  description: string;
  openingTime: string;
  closingTime: string;
  contactNumber: string;
  whatsappNumber?: string;
  email: string;
  address: string;
  avgResponseTimeMinutes: number;
  avgDeliveryTimeMinutes: number;
  deliveryCharges: number;
  minOrderValue: number;
  taxPercent: number;
  isOpen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const restaurantSettingsSchema = new Schema<IRestaurantSettings>(
  {
    key: { type: String, default: "main", unique: true },
    name: { type: String, required: true, maxlength: 100 },
    tagline: { type: String, default: "", maxlength: 200 },
    logo: { url: String, fileId: String },
    banner: { url: String, fileId: String },
    description: { type: String, default: "", maxlength: 1000 },
    openingTime: { type: String, default: "09:00" },
    closingTime: { type: String, default: "23:00" },
    contactNumber: { type: String, default: "" },
    whatsappNumber: { type: String },
    email: { type: String, default: "" },
    address: { type: String, default: "" },
    avgResponseTimeMinutes: { type: Number, default: 5 },
    avgDeliveryTimeMinutes: { type: Number, default: 30 },
    deliveryCharges: { type: Number, default: 0, min: 0 },
    minOrderValue: { type: Number, default: 0, min: 0 },
    taxPercent: { type: Number, default: 5, min: 0 },
    isOpen: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const RestaurantSettings: Model<IRestaurantSettings> =
  models.RestaurantSettings ||
  model<IRestaurantSettings>("RestaurantSettings", restaurantSettingsSchema);
