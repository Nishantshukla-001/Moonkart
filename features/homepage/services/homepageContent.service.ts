import "server-only";

import { destroyCloudinaryAsset } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import type { HomepageContentInput } from "@/features/homepage/validation/homepageContent.schema";

const SINGLETON_ID = "singleton";

/** Upsert (not findUnique-then-create) so the first-ever read can't race a concurrent first write on app cold start — same pattern as StoreSettings. */
export function getHomepageContent() {
  return prisma.homepageContent.upsert({
    where: { id: SINGLETON_ID },
    create: { id: SINGLETON_ID },
    update: {},
  });
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
