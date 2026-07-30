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
 * Each image renders inside its own fixed-aspect-ratio box (sized to the
 * recommended upload dimensions — desktop ~1920x800, mobile ~1080x1350)
 * with `fill` + `object-cover`, so any uploaded banner — whatever its exact
 * pixel dimensions — always fills the box completely edge-to-edge (no
 * letterboxing/white margins), cropping only the minimum needed rather than
 * shrinking the image to fit. Admins never need to pre-crop uploads to an
 * exact ratio for this to look right.
 *
 * Below `sm` (true phone widths), the mobile image instead renders in a
 * landscape 16:9 box rather than the tall 1080:1350 portrait box — the
 * portrait box is visually too tall on phones. `sm`–`lg` (tablet) keeps the
 * original portrait box completely unchanged; `lg`+ (desktop) is untouched.
 */
export function HeroBanner({ image, mobileImage, href, alt = "MoonKart Hero Banner" }: HeroBannerProps) {
  const hasDedicatedMobileImage = Boolean(mobileImage);

  return (
    <Container className="px-1 sm:px-6">
      {/* Mobile-only: even less outer horizontal padding (px-1 vs. the sm:+
          px-6 that reproduces the original spacing) so the banner occupies
          more of the screen width, plus a stronger layered shadow — a
          tighter, more saturated pink glow layer plus a deeper neutral
          elevation layer (using this design system's --shadow-soft-lg gray
          tone, at more depth than that token, echoing the same premium
          language as the Categories cards below) — for a genuine "popping
          out" floating feel. The white/pink ring layers that form the pink
          border itself are untouched. Tablet/desktop keep the exact
          original shadow via the `sm:shadow-[...]` override. */}
      <Link
        href={href}
        className="group relative block overflow-hidden rounded-[32px] bg-white p-2 shadow-[0_0_0_6px_white,0_0_0_12px_var(--blush-light),0_14px_30px_-6px_rgba(239,198,209,0.85),0_28px_56px_-14px_rgba(47,47,47,0.22)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_0_6px_white,0_0_0_14px_var(--blush-hover),0_28px_56px_-12px_rgba(239,198,209,0.65)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:p-3 sm:shadow-[0_0_0_6px_white,0_0_0_12px_var(--blush-light),0_24px_48px_-12px_rgba(239,198,209,0.55)]"
      >
        {hasDedicatedMobileImage && (
          <>
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[22px] sm:hidden">
              <Image
                src={mobileImage!}
                alt={alt}
                priority
                fill
                sizes="100vw"
                className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.01]"
              />
            </div>
            <div className="relative hidden aspect-[1080/1350] w-full overflow-hidden rounded-[22px] sm:block lg:hidden">
              <Image
                src={mobileImage!}
                alt={alt}
                priority
                fill
                sizes="100vw"
                className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.01]"
              />
            </div>
          </>
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
            className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.01]"
          />
        </div>
      </Link>
    </Container>
  );
}
