import Image, { type StaticImageData } from "next/image";
import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { cn } from "@/lib/utils";

interface HeroBannerProps {
  image: string | StaticImageData;
  /** Optional CMS-uploaded alternate for small screens — falls back to `image` at every breakpoint when unset. */
  mobileImage?: string | StaticImageData | null;
  href: string;
  alt?: string;
}

/**
 * Full-width, single-image hero — the entire banner is one clickable link.
 * Deliberately simple (no headline/CTA layout of its own) since the artwork
 * itself carries the branding — Homepage CMS fields (title/subtitle/button
 * text) are stored for admin editing but intentionally not rendered as text
 * overlays here, preserving the image-only design from the earlier hero pass.
 *
 * Each image renders inside its own aspect-ratio box (sized to the
 * recommended upload dimensions — desktop ~1920x800, mobile ~1080x1350)
 * with `fill` + `object-contain`, so the box height always derives from the
 * image's ratio instead of a fixed px height, and the artwork is never
 * cropped or zoomed regardless of the exact pixels an admin uploads.
 */
export function HeroBanner({ image, mobileImage, href, alt = "MoonKart Hero Banner" }: HeroBannerProps) {
  const hasDedicatedMobileImage = Boolean(mobileImage);

  return (
    <Container>
      <Link
        href={href}
        className="group relative block overflow-hidden rounded-[32px] bg-white p-2 shadow-[0_0_0_6px_white,0_0_0_12px_var(--blush-light),0_24px_48px_-12px_rgba(239,198,209,0.55)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_0_6px_white,0_0_0_14px_var(--blush-hover),0_28px_56px_-12px_rgba(239,198,209,0.65)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:p-3"
      >
        {hasDedicatedMobileImage && (
          <div className="relative aspect-[1080/1350] w-full overflow-hidden rounded-[22px] lg:hidden">
            <Image
              src={mobileImage!}
              alt={alt}
              priority
              fill
              sizes="100vw"
              className="object-contain transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.01]"
            />
          </div>
        )}
        <div
          className={cn(
            "relative aspect-[1920/800] w-full overflow-hidden rounded-[22px]",
            hasDedicatedMobileImage && "hidden lg:block"
          )}
        >
          <Image
            src={image}
            alt={alt}
            priority
            fill
            sizes="(max-width: 1024px) 100vw, 1280px"
            className="object-contain transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.01]"
          />
        </div>
      </Link>
    </Container>
  );
}
