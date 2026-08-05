import { getSession } from "@/lib/auth/session";
import { getSiteConfig } from "@/config/site";
import { getRestaurantSettings } from "@/services/settings.service";
import { listCategories } from "@/services/category.service";
import { listMenuItems } from "@/services/menu.service";
import { listActiveCoupons } from "@/services/coupon.service";
import { toMenuItemDTO } from "@/lib/serializers/menu-item";
import { ITEM_TAG } from "@/constants";

import { Hero } from "@/components/home/hero";
import { CategoryStrip } from "@/components/home/category-strip";
import { MenuItemRow } from "@/components/home/menu-item-row";
import { Offers } from "@/components/home/offers";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { Gallery } from "@/components/home/gallery";
import { Testimonials } from "@/components/home/testimonials";
import { FAQ } from "@/components/home/faq";
import { Contact } from "@/components/home/contact";

export default async function HomePage() {
  const site = getSiteConfig();

  const [session, settings, categories, specials, popular, bestSellers, coupons] = await Promise.all([
    getSession(),
    getRestaurantSettings(),
    listCategories(),
    listMenuItems({ tag: ITEM_TAG.TODAYS_SPECIAL, pageSize: 8 }),
    listMenuItems({ tag: ITEM_TAG.POPULAR, pageSize: 8 }),
    listMenuItems({ tag: ITEM_TAG.BEST_SELLER, pageSize: 8 }),
    listActiveCoupons(),
  ]);

  const isAuthenticated = Boolean(session);

  return (
    <>
      <Hero settings={settings} siteName={site.name} />
      <CategoryStrip categories={categories} />
      <MenuItemRow
        id="specials"
        eyebrow="Fresh today"
        title="Today's Specials"
        description="Hand-picked dishes our kitchen is featuring today."
        items={specials.items.map(toMenuItemDTO)}
        isAuthenticated={isAuthenticated}
        viewAllHref="/menu?tag=todays_special"
      />
      <MenuItemRow
        eyebrow="Crowd favorites"
        title="Popular Dishes"
        items={popular.items.map(toMenuItemDTO)}
        isAuthenticated={isAuthenticated}
        viewAllHref="/menu?tag=popular"
      />
      <Offers coupons={coupons} />
      <MenuItemRow
        id="best-sellers"
        eyebrow="Most ordered"
        title="Best Sellers"
        items={bestSellers.items.map(toMenuItemDTO)}
        isAuthenticated={isAuthenticated}
        viewAllHref="/menu?tag=best_seller"
      />
      <WhyChooseUs />
      <Gallery />
      <Testimonials />
      <FAQ siteName={site.name} avgDeliveryTimeMinutes={settings.avgDeliveryTimeMinutes} />
      <Contact settings={settings} supportEmail={site.supportEmail} />
    </>
  );
}
