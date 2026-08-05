import { Schema, model, models, type Model, type Document, type Types } from "mongoose";
import {
  ORDER_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  type OrderStatus,
  type PaymentMethod,
  type PaymentStatus,
} from "@/constants";

export interface IOrderItem {
  menuItem: Types.ObjectId;
  name: string;
  image?: string;
  unitPrice: number;
  quantity: number;
}

export interface IStatusHistoryEntry {
  status: OrderStatus;
  changedAt: Date;
  changedBy?: Types.ObjectId;
  note?: string;
}

export interface IOrder extends Document {
  orderId: string;
  user: Types.ObjectId;
  items: IOrderItem[];
  hostelName: string;
  roomNumber: string;
  landmark?: string;
  contactPhone: string;
  subtotal: number;
  taxAmount: number;
  deliveryFee: number;
  discountAmount: number;
  total: number;
  couponCode?: string;
  status: OrderStatus;
  statusHistory: IStatusHistoryEntry[];
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  customerNotes?: string;
  cancelReason?: string;
  estimatedDeliveryAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    menuItem: { type: Schema.Types.ObjectId, ref: "MenuItem", required: true },
    name: { type: String, required: true },
    image: { type: String },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const statusHistorySchema = new Schema<IStatusHistoryEntry>(
  {
    status: { type: String, enum: Object.values(ORDER_STATUS), required: true },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: Schema.Types.ObjectId, ref: "User" },
    note: { type: String, maxlength: 300 },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], required: true, validate: (v: unknown[]) => v.length > 0 },
    hostelName: { type: String, required: true },
    roomNumber: { type: String, required: true },
    landmark: { type: String },
    contactPhone: { type: String, required: true },
    subtotal: { type: Number, required: true, min: 0 },
    taxAmount: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    couponCode: { type: String, trim: true, uppercase: true },
    status: { type: String, enum: Object.values(ORDER_STATUS), default: ORDER_STATUS.RECEIVED },
    statusHistory: { type: [statusHistorySchema], default: [] },
    paymentMethod: { type: String, enum: Object.values(PAYMENT_METHOD), default: PAYMENT_METHOD.COD },
    paymentStatus: { type: String, enum: Object.values(PAYMENT_STATUS), default: PAYMENT_STATUS.PENDING },
    customerNotes: { type: String, maxlength: 500 },
    cancelReason: { type: String, maxlength: 300 },
    estimatedDeliveryAt: { type: Date },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });

export const Order: Model<IOrder> = models.Order || model<IOrder>("Order", orderSchema);
