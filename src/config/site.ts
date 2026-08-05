import { env } from "./env";

export function getSiteConfig() {
  return {
    name: env.APP_NAME,
    tagline: env.APP_TAGLINE,
    description: env.APP_DESCRIPTION,
    url: env.APP_URL,
    supportEmail: env.SUPPORT_EMAIL,
    logoUrl: "/images/logo.webp",
    faviconUrl: "/favicon.ico",
    currency: env.DEFAULT_CURRENCY,
    deliveryFee: env.DEFAULT_DELIVERY_FEE,
    minOrderValue: env.DEFAULT_MIN_ORDER_VALUE,
    taxPercent: env.DEFAULT_TAX_PERCENT,
    social: {
      instagram: undefined as string | undefined,
      facebook: undefined as string | undefined,
      twitter: undefined as string | undefined,
    },
  } as const;
}

export type SiteConfig = ReturnType<typeof getSiteConfig>;
