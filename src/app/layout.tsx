import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import Script from "next/script";
import "./globals.css";
import { getSiteConfig } from "@/config/site";
import { AppProviders } from "@/components/providers/app-providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export async function generateMetadata(): Promise<Metadata> {
  const site = getSiteConfig();

  return {
    metadataBase: new URL(site.url),
    title: { default: site.name, template: `%s · ${site.name}` },
    description: site.description,
    applicationName: site.name,
    manifest: "/manifest.webmanifest",
    icons: {
      icon: site.faviconUrl,
      shortcut: site.faviconUrl,
      apple: site.faviconUrl,
    },
    openGraph: {
      type: "website",
      siteName: site.name,
      title: site.name,
      description: site.description,
      url: site.url,
      images: [{ url: site.logoUrl, width: 512, height: 512, alt: site.name }],
    },
    twitter: {
      card: "summary",
      title: site.name,
      description: site.description,
      images: [site.logoUrl],
    },
  };
}

export function generateViewport(): Viewport {
  return {
    width: "device-width",
    initialScale: 1,
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: "#ffffff" },
      { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    ],
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const siteConfig = getSiteConfig();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem('theme')||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`}
        </Script>
        <AppProviders siteConfig={siteConfig}>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
