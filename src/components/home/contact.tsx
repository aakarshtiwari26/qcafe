import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import type { IRestaurantSettings } from "@/models";

export function Contact({ settings, supportEmail }: { settings: IRestaurantSettings; supportEmail: string }) {
  const email = settings.email || supportEmail;
  const rows = [
    settings.contactNumber && { icon: Phone, label: "Call us", value: settings.contactNumber, href: `tel:${settings.contactNumber}` },
    settings.whatsappNumber && {
      icon: MessageCircle,
      label: "WhatsApp",
      value: settings.whatsappNumber,
      href: `https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`,
    },
    { icon: Mail, label: "Email", value: email, href: `mailto:${email}` },
    settings.address && { icon: MapPin, label: "Address", value: settings.address },
    { icon: Clock, label: "Hours", value: `${settings.openingTime} – ${settings.closingTime}, daily` },
  ].filter(Boolean) as { icon: typeof Phone; label: string; value: string; href?: string }[];

  return (
    <section id="contact" className="border-t border-border/60">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Contact" title="Get in touch" />
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => {
            const Content = (
              <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand/10">
                  <row.icon className="size-4 text-brand" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{row.label}</p>
                  <p className="truncate text-sm font-medium">{row.value}</p>
                </div>
              </div>
            );
            return row.href ? (
              <a key={row.label} href={row.href} target={row.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                {Content}
              </a>
            ) : (
              <div key={row.label}>{Content}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
