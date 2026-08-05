import Image from "next/image";
import { SectionHeading } from "@/components/shared/section-heading";

const GALLERY_IMAGES = [
  "Special-Veg-Thali.webp",
  "Supreme-Burger.webp",
  "Steam-Momos.webp",
  "Masala-Dosa.webp",
  "Veg-Club-Sandwich.webp",
  "Chocolate-Shake.webp",
];

export function Gallery() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="Gallery" title="A taste of what's coming" />
      <div className="mt-7 grid grid-cols-3 gap-2.5 sm:gap-3 md:grid-cols-6">
        {GALLERY_IMAGES.map((file, i) => (
          <div
            key={file}
            className={`relative aspect-square overflow-hidden rounded-xl ${i < 2 ? "col-span-1 md:col-span-2 md:aspect-square" : ""}`}
          >
            <Image
              src={`/images/menu/${file}`}
              alt=""
              fill
              sizes="(max-width: 768px) 33vw, 16vw"
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
