import "server-only";

import type { HomepageContent } from "@prisma/client";

import { destroyCloudinaryAsset } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import type { HomepageContentInput } from "@/features/homepage/validation/homepageContent.schema";

const SINGLETON_ID = "singleton";

/**
 * Mirrors the Prisma schema's own `@default(...)` values field-for-field.
 * Returned in place of the database row when the singleton hasn't been
 * created yet, so every page that reads homepage content — including the
 * root layout, which wraps every route (e.g. /wishlist) — never has to
 * write to the database just to render.
 */
const DEFAULT_HOMEPAGE_CONTENT: HomepageContent = {
  id: SINGLETON_ID,
  heroImageUrl: null,
  heroImagePublicId: null,
  heroMobileImageUrl: null,
  heroMobileImagePublicId: null,
  heroTitle: null,
  heroSubtitle: null,
  heroButtonText: null,
  heroButtonLink: null,
  heroIsVisible: true,
  announcementText: null,
  announcementLink: null,
  announcementIsEnabled: true,
  featuredCategoriesTitle: "Featured Categories",
  featuredCategoriesSubtitle: null,
  featuredCategoriesIsVisible: true,
  moonEssentialsTitle: "Moon Essentials",
  moonEssentialsSubtitle: null,
  moonEssentialsIsVisible: true,
  promoEyebrow: null,
  promoHeading: null,
  promoSubheading: null,
  promoButtonText: null,
  promoButtonLink: null,
  promoImageUrl: null,
  promoImagePublicId: null,
  promoMobileImageUrl: null,
  promoMobileImagePublicId: null,
  promoIsVisible: true,
  followOurStyleTitle: "Follow Our Style",
  instagramUsername: null,
  followOurStyleIsVisible: true,
  newArrivalsTitle: "New Arrivals",
  newArrivalsSubtitle: null,
  newArrivalsIsVisible: true,
  bestSellersTitle: "Best Sellers",
  bestSellersSubtitle: null,
  bestSellersIsVisible: true,
  whyChooseUsSubtitle: null,
  whyChooseUsIsVisible: true,
  testimonialsTitle: "Loved by Our Customers",
  testimonialsSubtitle: null,
  testimonialsIsVisible: true,
  newsletterHeading: "Join the MoonKart Circle",
  newsletterSubheading: null,
  newsletterIsVisible: true,
  footerText: null,
  copyrightText: null,
  updatedAt: new Date(0),
};

/**
 * Read-only — never writes. Falls back to in-memory schema defaults until an
 * admin explicitly saves the homepage content form (see updateHomepageContent
 * below, which is the only place this row is ever created), so no page
 * render can trigger a database write.
 */
export async function getHomepageContent(): Promise<HomepageContent> {
  const content = await prisma.homepageContent.findUnique({ where: { id: SINGLETON_ID } });
  return content ?? DEFAULT_HOMEPAGE_CONTENT;
}

const IMAGE_PUBLIC_ID_FIELDS = [
  "heroImagePublicId",
  "heroMobileImagePublicId",
  "promoImagePublicId",
  "promoMobileImagePublicId",
] as const;

export async function updateHomepageContent(data: HomepageContentInput) {
  const previous = await prisma.homepageContent.findUnique({
    where: { id: SINGLETON_ID },
    select: {
      heroImagePublicId: true,
      heroMobileImagePublicId: true,
      promoImagePublicId: true,
      promoMobileImagePublicId: true,
    },
  });

  const normalized = Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, value === "" ? null : value])
  ) as unknown as HomepageContentInput;

  const updated = await prisma.homepageContent.upsert({
    where: { id: SINGLETON_ID },
    create: { id: SINGLETON_ID, ...normalized },
    update: normalized,
  });

  if (previous) {
    for (const publicIdField of IMAGE_PUBLIC_ID_FIELDS) {
      const previousPublicId = previous[publicIdField];
      const nextPublicId = updated[publicIdField];
      if (previousPublicId && previousPublicId !== nextPublicId) {
        await destroyCloudinaryAsset(previousPublicId);
      }
    }
  }

  return updated;
}
