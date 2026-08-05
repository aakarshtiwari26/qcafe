"use client";

import { ThemeProvider } from "./theme-provider";
import { QueryProvider } from "./query-provider";
import { SiteConfigProvider } from "./site-config-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import type { SiteConfig } from "@/config/site";

export function AppProviders({
  siteConfig,
  children,
}: {
  siteConfig: SiteConfig;
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <SiteConfigProvider config={siteConfig}>
        <QueryProvider>
          <TooltipProvider delayDuration={150}>
            {children}
            <Toaster richColors closeButton position="top-center" />
          </TooltipProvider>
        </QueryProvider>
      </SiteConfigProvider>
    </ThemeProvider>
  );
}
