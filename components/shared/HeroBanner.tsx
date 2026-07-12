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
        className="group block overflow-hidden rounded-[28px] shadow-soft transition-shadow duration-300 hover:shadow-soft-lg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Image
          src={image}
          alt="MoonKart Hero Banner"
          priority
          sizes="(max-width: 1024px) 100vw, 1280px"
          className="h-auto w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.01]"
        />
      </Link>
    </Container>
  );
}
