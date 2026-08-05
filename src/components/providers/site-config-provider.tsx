"use client";

import { createContext, useContext } from "react";
import type { SiteConfig } from "@/config/site";

const SiteConfigContext = createContext<SiteConfig | null>(null);

/**
 * Bridges the server-only site config into Client Components. The value is
 * produced once by a Server Component (root layout) from env vars and
 * threaded down as plain props — no secrets, no `NEXT_PUBLIC_` sprawl.
 */
export function SiteConfigProvider({
  config,
  children,
}: {
  config: SiteConfig;
  children: React.ReactNode;
}) {
  return <SiteConfigContext.Provider value={config}>{children}</SiteConfigContext.Provider>;
}

export function useSiteConfig(): SiteConfig {
  const ctx = useContext(SiteConfigContext);
  if (!ctx) {
    throw new Error("useSiteConfig must be used within a SiteConfigProvider");
  }
  return ctx;
}
