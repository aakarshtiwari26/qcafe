export const USER_ROLE = {
  CUSTOMER: "customer",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
} as const;
export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export const USER_STATUS = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
  PENDING_VERIFICATION: "pending_verification",
} as const;
export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

export const ORDER_STATUS = {
  RECEIVED: "received",
  CONFIRMED: "confirmed",
  PREPARING: "preparing",
  READY: "ready",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;
export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  ORDER_STATUS.RECEIVED,
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.READY,
  ORDER_STATUS.OUT_FOR_DELIVERY,
  ORDER_STATUS.DELIVERED,
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [ORDER_STATUS.RECEIVED]: "Order Received",
  [ORDER_STATUS.CONFIRMED]: "Confirmed",
  [ORDER_STATUS.PREPARING]: "Preparing",
  [ORDER_STATUS.READY]: "Ready",
  [ORDER_STATUS.OUT_FOR_DELIVERY]: "Out for Delivery",
  [ORDER_STATUS.DELIVERED]: "Delivered",
  [ORDER_STATUS.CANCELLED]: "Cancelled",
};

export const PAYMENT_METHOD = {
  COD: "cod",
} as const;
export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

export const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const;
export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const SPICE_LEVEL = {
  NONE: "none",
  MILD: "mild",
  MEDIUM: "medium",
  HOT: "hot",
} as const;
export type SpiceLevel = (typeof SPICE_LEVEL)[keyof typeof SPICE_LEVEL];

export const FOOD_TYPE = {
  VEG: "veg",
  NON_VEG: "non_veg",
  EGG: "egg",
} as const;
export type FoodType = (typeof FOOD_TYPE)[keyof typeof FOOD_TYPE];

export const ITEM_TAG = {
  POPULAR: "popular",
  RECOMMENDED: "recommended",
  BEST_SELLER: "best_seller",
  TODAYS_SPECIAL: "todays_special",
} as const;
export type ItemTag = (typeof ITEM_TAG)[keyof typeof ITEM_TAG];

export const OTP_PURPOSE = {
  REGISTER: "register",
  LOGIN_2FA: "login_2fa",
  RESET_PASSWORD: "reset_password",
  CHANGE_EMAIL_CURRENT: "change_email_current",
  CHANGE_EMAIL_NEW: "change_email_new",
  CHANGE_PHONE: "change_phone",
} as const;
export type OtpPurpose = (typeof OTP_PURPOSE)[keyof typeof OTP_PURPOSE];

export const ACTIVITY_ACTION = {
  USER_REGISTERED: "user.registered",
  USER_LOGIN: "user.login",
  USER_LOGIN_FAILED: "user.login_failed",
  USER_SUSPENDED: "user.suspended",
  USER_ACTIVATED: "user.activated",
  PASSWORD_CHANGED: "user.password_changed",
  PASSWORD_RESET: "user.password_reset",
  EMAIL_CHANGED: "user.email_changed",
  PHONE_CHANGED: "user.phone_changed",
  ORDER_CREATED: "order.created",
  ORDER_STATUS_CHANGED: "order.status_changed",
  ORDER_CANCELLED: "order.cancelled",
  MENU_ITEM_CREATED: "menu_item.created",
  MENU_ITEM_UPDATED: "menu_item.updated",
  MENU_ITEM_DELETED: "menu_item.deleted",
  CATEGORY_CREATED: "category.created",
  CATEGORY_UPDATED: "category.updated",
  CATEGORY_DELETED: "category.deleted",
  SETTINGS_UPDATED: "settings.updated",
} as const;
export type ActivityAction = (typeof ACTIVITY_ACTION)[keyof typeof ACTIVITY_ACTION];

export const COOKIE_NAMES = {
  ACCESS_TOKEN: "qc_access_token",
  REFRESH_TOKEN: "qc_refresh_token",
} as const;

export const AUTH_LIMITS = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_LOCKOUT_MINUTES: 15,
  MAX_OTP_ATTEMPTS: 5,
  OTP_RESEND_COOLDOWN_SECONDS: 60,
  BCRYPT_SALT_ROUNDS: 12,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

export const ORDER_ID_PREFIX = "QC";
