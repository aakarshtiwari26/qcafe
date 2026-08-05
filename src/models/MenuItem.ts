import { Schema, model, models, type Model, type Document, type Types } from "mongoose";
import { FOOD_TYPE, SPICE_LEVEL, ITEM_TAG, type FoodType, type SpiceLevel, type ItemTag } from "@/constants";

export interface INutritionalInfo {
  calories?: number;
  proteinGrams?: number;
  carbsGrams?: number;
  fatGrams?: number;
}

export interface IMenuItemImage {
  url: string;
  fileId: string;
  isPrimary: boolean;
}

export interface IMenuItem extends Document {
  name: string;
  slug: string;
  description: string;
  category: Types.ObjectId;
  price: number;
  discountPrice?: number;
  images: IMenuItemImage[];
  isAvailable: boolean;
  isHidden: boolean;
  prepTimeMinutes: number;
  foodType: FoodType;
  spiceLevel: SpiceLevel;
  tags: ItemTag[];
  inStock: boolean;
  nutritionalInfo?: INutritionalInfo;
  sortOrder: number;
  ratingAvg: number;
  ratingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const menuItemSchema = new Schema<IMenuItem>(
  {
    name: { type: String, required: true, trim: true, maxlength: 150 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 180 },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: {
      type: Number,
      min: 0,
      validate: [
        function (this: IMenuItem, value: number) {
          return value == null || value < this.price;
        },
        "Discount price must be less than the regular price",
      ] as [(this: IMenuItem, value: number) => boolean, string],
    },
    images: {
      type: [
        new Schema<IMenuItemImage>(
          {
            url: { type: String, required: true },
            fileId: { type: String, required: true },
            isPrimary: { type: Boolean, default: false },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    isAvailable: { type: Boolean, default: true },
    isHidden: { type: Boolean, default: false },
    prepTimeMinutes: { type: Number, default: 15, min: 0 },
    foodType: { type: String, enum: Object.values(FOOD_TYPE), required: true },
    spiceLevel: { type: String, enum: Object.values(SPICE_LEVEL), default: SPICE_LEVEL.NONE },
    tags: { type: [String], enum: Object.values(ITEM_TAG), default: [] },
    inStock: { type: Boolean, default: true },
    nutritionalInfo: {
      calories: Number,
      proteinGrams: Number,
      carbsGrams: Number,
      fatGrams: Number,
    },
    sortOrder: { type: Number, default: 0 },
    ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

menuItemSchema.index({ category: 1, sortOrder: 1 });
menuItemSchema.index({ isAvailable: 1, isHidden: 1 });
menuItemSchema.index({ tags: 1 });
menuItemSchema.index({ name: "text", description: "text" });

export const MenuItem: Model<IMenuItem> =
  models.MenuItem || model<IMenuItem>("MenuItem", menuItemSchema);
