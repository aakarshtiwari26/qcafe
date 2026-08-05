import { Schema, model, models, type Model, type Document, type Types } from "mongoose";
import { USER_ROLE, USER_STATUS, type UserRole, type UserStatus } from "@/constants";

export interface IAddress {
  _id?: Types.ObjectId;
  label: string;
  hostel: Types.ObjectId;
  roomNumber: string;
  landmark?: string;
  isDefault: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  hostel?: Types.ObjectId;
  profileImage?: { url: string; fileId: string };
  addresses: Types.DocumentArray<IAddress>;
  favorites: Types.ObjectId[];
  emailVerifiedAt?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddress>(
  {
    label: { type: String, required: true, trim: true, maxlength: 50 },
    hostel: { type: Schema.Types.ObjectId, ref: "Hostel", required: true },
    roomNumber: { type: String, required: true, trim: true, maxlength: 20 },
    landmark: { type: String, trim: true, maxlength: 200 },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    passwordHash: { type: String, required: true, select: false },
    phone: { type: String, trim: true, sparse: true, unique: true, maxlength: 20 },
    role: { type: String, enum: Object.values(USER_ROLE), default: USER_ROLE.CUSTOMER },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.PENDING_VERIFICATION,
    },
    hostel: { type: Schema.Types.ObjectId, ref: "Hostel" },
    profileImage: {
      url: { type: String },
      fileId: { type: String },
    },
    addresses: { type: [addressSchema], default: [] },
    favorites: [{ type: Schema.Types.ObjectId, ref: "MenuItem" }],
    emailVerifiedAt: { type: Date },
    loginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, select: false },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ hostel: 1 });
userSchema.index({ createdAt: -1 });

export const User: Model<IUser> = models.User || model<IUser>("User", userSchema);
