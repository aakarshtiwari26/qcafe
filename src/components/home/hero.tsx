import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RestaurantStatusBadge } from "@/components/home/restaurant-status-badge";
import type { IRestaurantSettings } from "@/models";

export function Hero({ settings, siteName }: { settings: IRestaurantSettings; siteName: string }) {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,color-mix(in_oklch,var(--brand),transparent_88%),transparent_45%),radial-gradient(circle_at_85%_0%,color-mix(in_oklch,var(--brand),transparent_92%),transparent_40%)]" />

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-24 lg:px-8">
        <div>
          <RestaurantStatusBadge
            isOpenToggle={settings.isOpen}
            openingTime={settings.openingTime}
            closingTime={settings.closingTime}
          />

          <h1 className="mt-5 text-[34px] font-bold leading-[1.1] tracking-tight sm:text-5xl">
            Great food,
            <br />
            delivered to your door.
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
            {settings.description || `Order fresh, made-to-order meals from ${siteName} — straight to your hostel, in minutes.`}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button size="lg" className="rounded-full bg-brand px-6 text-brand-foreground hover:bg-brand/90" asChild>
              <Link href="/menu">
                Order now <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-6" asChild>
              <Link href="/dashboard/orders">Track an order</Link>
            </Button>
          </div>

          <div className="mt-9 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="size-4 text-brand" /> ~{settings.avgDeliveryTimeMinutes} min delivery
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="size-4 fill-brand text-brand" /> Loved by students
            </span>
            {settings.address && (
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4 text-brand" /> {settings.address}
              </span>
            )}
          </div>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-[2rem] border border-border/60 shadow-2xl lg:max-w-none">
          <Image
            src="https://ik.imagekit.io/aakarshtiwari/qcafe/menu/special-veg-thali.webp"
            alt="Featured dish"
            fill
            priority
            sizes="(max-width: 1024px) 90vw, 45vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
