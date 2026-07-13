import { BadgeCheck, PackageCheck, RotateCcw, ShieldCheck, type LucideIcon } from "lucide-react";
import type { StaticImageData } from "next/image";

import pinkTexture from "@/assets/pinkcolor.jpeg";
import { ROUTES } from "@/constants/routes";
import { placeholderImage } from "@/lib/placeholderImages";

/**
 * Centralized homepage marketing copy and banner content.
 *
 * app/page.tsx and its section components must never hardcode this text or
 * these images inline — everything is sourced from here so copy, CTAs, and
 * banner imagery can all be updated in one place without touching any
 * component.
 */

export const heroContent = {
  eyebrow: "New Season Edit",
  heading: "Elevate Your Everyday Elegance",
  subheading:
    "Discover curated jewellery, beauty essentials, and fashion pieces designed for the modern woman who values quality and grace.",
  ctaLabel: "Shop New Arrivals",
  ctaHref: ROUTES.products,
  secondaryCtaLabel: "Explore Collections",
  secondaryCtaHref: ROUTES.categories,
  image: placeholderImage("moonkart-hero", 900, 900),
  imageAlt: "A curated edit of MoonKart jewellery and lifestyle pieces",
};

export const promoBannerContent = {
  eyebrow: "Limited Time",
  heading: "Up to 30% Off Statement Jewellery",
  subheading:
    "Elevate your look with our most-loved pieces, at prices as beautiful as the designs.",
  ctaLabel: "Shop the Sale",
  ctaHref: ROUTES.products,
  background: pinkTexture as StaticImageData,
};

export const newsletterContent = {
  heading: "Join the MoonKart Circle",
  subheading: "Be the first to know about new arrivals, curated edits, and members-only offers.",
  background: pinkTexture as StaticImageData,
};

export interface FeatureHighlight {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const whyChooseUsFeatures: FeatureHighlight[] = [
  {
    icon: BadgeCheck,
    title: "Authentic Products",
    description: "Every piece is sourced and quality-checked before it reaches you.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description: "Checkout with confidence using trusted, encrypted payment methods.",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "Change of heart? Return eligible items with a hassle-free process.",
  },
  {
    icon: PackageCheck,
    title: "Premium Packaging",
    description: "Every order arrives thoughtfully packaged, ready to gift or keep.",
  },
];

export const homepageSections = {
  featuredCategories: {
    title: "Featured Categories",
    subtitle: "Shop by category and find pieces that feel like you.",
  },
  trending: {
    title: "Trending Products",
    subtitle: "What everyone's adding to their bag right now.",
  },
  moonEssentials: {
    title: "Moon Essentials",
    subtitle: "Everyday essentials you'll love.",
  },
  newArrivals: {
    title: "New Arrivals",
    subtitle: "Fresh drops, straight from our latest edit.",
  },
  bestSellers: {
    title: "Best Sellers",
    subtitle: "Loved again and again by the MoonKart community.",
  },
  featuredCollections: {
    title: "Featured Collections",
    subtitle: "Curated edits for every moment, mood, and occasion.",
  },
  whyChooseUs: {
    subtitle: "A premium shopping experience built on quality, trust, and care.",
  },
  testimonials: {
    title: "Loved by Our Customers",
    subtitle: "Real words from the MoonKart community.",
  },
} as const;
