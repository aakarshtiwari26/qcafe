import Link from "next/link";
import Image from "next/image";
import { Camera, Users2, Send, MapPin, Phone, Mail, Clock } from "lucide-react";
import { getSiteConfig } from "@/config/site";
import { getRestaurantSettings } from "@/services/settings.service";

const EXPLORE_LINKS = [
  { href: "/menu", label: "Full Menu" },
  { href: "/#specials", label: "Today's Specials" },
  { href: "/#best-sellers", label: "Best Sellers" },
  { href: "/#faq", label: "FAQ" },
];

const ACCOUNT_LINKS = [
  { href: "/login", label: "Sign in" },
  { href: "/register", label: "Create account" },
  { href: "/dashboard/orders", label: "Track an order" },
  { href: "/dashboard/favorites", label: "Favorites" },
];

export async function Footer() {
  const site = getSiteConfig();
  const settings = await getRestaurantSettings().catch(() => null);

  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src={site.logoUrl} alt={site.name} width={30} height={30} className="size-7.5 rounded-lg" />
              <span className="text-lg font-bold tracking-tight">{site.name}</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground max-w-xs">{site.tagline}</p>
            <div className="mt-4 flex gap-3">
              <SocialIcon href={site.social.instagram} icon={Camera} label="Instagram" />
              <SocialIcon href={site.social.facebook} icon={Users2} label="Facebook" />
              <SocialIcon href={site.social.twitter} icon={Send} label="Twitter" />
            </div>
          </div>

          <FooterColumn title="Explore" links={EXPLORE_LINKS} />
          <FooterColumn title="Account" links={ACCOUNT_LINKS} />

          <div>
            <h3 className="text-sm font-semibold">Contact</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {settings?.address && (
                <li className="flex gap-2">
                  <MapPin className="size-4 shrink-0 mt-0.5" /> {settings.address}
                </li>
              )}
              {settings?.contactNumber && (
                <li className="flex gap-2">
                  <Phone className="size-4 shrink-0 mt-0.5" /> {settings.contactNumber}
                </li>
              )}
              <li className="flex gap-2">
                <Mail className="size-4 shrink-0 mt-0.5" /> {settings?.email || site.supportEmail}
              </li>
              {settings?.openingTime && settings?.closingTime && (
                <li className="flex gap-2">
                  <Clock className="size-4 shrink-0 mt-0.5" />
                  {settings.openingTime} &ndash; {settings.closingTime}
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col-reverse items-center justify-between gap-4 border-t border-border/60 pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">Made fresh, delivered fast.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialIcon({
  href,
  icon: Icon,
  label,
}: {
  href?: string;
  icon: typeof Camera;
  label: string;
}) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
    >
      <Icon className="size-4" />
    </a>
  );
}
