import Image, { type StaticImageData } from "next/image";
import Link from "next/link";

import { Container } from "@/components/layout/Container";

interface HeroBannerProps {
  image: StaticImageData;
  href: string;
}

/**
 * Full-width, single-image hero — the entire banner is one clickable link to
 * the homepage's Explore section. Deliberately simple (no headline/CTA
 * layout of its own) since the artwork itself carries the branding.
 */
export function HeroBanner({ image, href }: HeroBannerProps) {
  return (
    <Container>
      <Link
        href={href}
        className="group relative block overflow-hidden rounded-[32px] bg-white p-2 shadow-[0_0_0_6px_white,0_0_0_12px_var(--blush-light),0_24px_48px_-12px_rgba(239,198,209,0.55)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_0_6px_white,0_0_0_14px_var(--blush-hover),0_28px_56px_-12px_rgba(239,198,209,0.65)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:p-3"
      >
        <Image
          src={image}
          alt="MoonKart Hero Banner"
          priority
          sizes="(max-width: 1024px) 100vw, 1280px"
          /* Mobile/tablet get a fixed, taller box (object-cover center-crops
             the wide artwork to fill it without stretching); lg+ reverts to
             the image's natural aspect ratio via h-auto, unchanged from
             before this pass. */
          className="h-[340px] w-full rounded-[22px] object-cover object-center transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.01] md:h-[320px] lg:h-auto"
        />
      </Link>
    </Container>
  );
}
