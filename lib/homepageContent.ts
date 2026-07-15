import { BadgeCheck, PackageCheck, RotateCcw, ShieldCheck, type LucideIcon } from "lucide-react";

/**
 * The "Why Choose Us" feature tiles — the one piece of homepage content that
 * stays hardcoded rather than moving into HomepageContent (Phase 10's CMS).
 * Everything else the homepage renders (hero, banners, section titles,
 * visibility) now comes from features/homepage/services/homepageContent.service.ts.
 */

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
