import { env } from "./env";

/**
 * The single place that turns raw env vars into the shape the UI, emails,
 * metadata, and manifest actually consume. Change APP_NAME (etc.) in .env
 * and every surface below updates — nothing here should ever be a literal
 * restaurant name.
 *
 * Server-only: reads `env` directly. Server Components can call this freely.
 * Client Components must receive the result via props/context — see
 * `src/components/providers/site-config-provider.tsx`.
 */
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
