import { z } from "zod";

/**
 * Every environment variable the app reads, validated once at boot.
 * Import `env` anywhere instead of touching `process.env` directly —
 * this is the single source of truth and fails fast on misconfiguration.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // App identity — drives navbar, metadata, emails, PWA, everything. Never hardcode.
  APP_NAME: z.string().min(1).default("QCafe"),
  APP_TAGLINE: z.string().default("Fresh food, delivered fast"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  APP_DESCRIPTION: z.string().default("Order delicious food online"),
  SUPPORT_EMAIL: z.string().email().default("support@example.com"),

  // Database
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

  // Auth
  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),
  OTP_EXPIRY_MINUTES: z.coerce.number().default(10),
  OTP_LENGTH: z.coerce.number().default(6),

  // SMTP
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().default(587),
  // z.coerce.boolean() is a trap for env vars: Boolean("false") is `true`
  // in JS (any non-empty string is truthy), so it would silently invert
  // SMTP_SECURE=false. Parse the literal strings instead.
  SMTP_SECURE: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  SMTP_USER: z.string().min(1),
  SMTP_PASSWORD: z.string().min(1),
  SMTP_FROM_NAME: z.string().optional(),
  SMTP_FROM_EMAIL: z.string().email().optional(),

  // ImageKit
  IMAGEKIT_PUBLIC_KEY: z.string().min(1),
  IMAGEKIT_PRIVATE_KEY: z.string().min(1),
  IMAGEKIT_URL_ENDPOINT: z.string().url(),

  // Security
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

  // Business defaults (overridable at runtime via RestaurantSettings in DB)
  DEFAULT_CURRENCY: z.string().default("INR"),
  DEFAULT_DELIVERY_FEE: z.coerce.number().default(0),
  DEFAULT_MIN_ORDER_VALUE: z.coerce.number().default(0),
  DEFAULT_TAX_PERCENT: z.coerce.number().default(5),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `Invalid environment configuration.\n${issues}\n\nCheck your .env file against .env.example.`
    );
  }

  return parsed.data;
}

export const env = loadEnv();
