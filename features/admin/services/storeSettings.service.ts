import "server-only";

import { prisma } from "@/lib/prisma";
import { destroyCloudinaryAsset } from "@/lib/cloudinary";
import type { StoreSettingsInput } from "@/features/admin/validation/storeSettings.schema";

const SINGLETON_ID = "singleton";

/** Upsert (not findUnique-then-create) so the first-ever read can't race a concurrent first write on app cold start. */
export function getStoreSettings() {
  return prisma.storeSettings.upsert({
    where: { id: SINGLETON_ID },
    create: { id: SINGLETON_ID },
    update: {},
  });
}

export async function updateStoreSettings(data: StoreSettingsInput) {
  const previous = await prisma.storeSettings.findUnique({
    where: { id: SINGLETON_ID },
    select: { logoPublicId: true },
  });

  const updated = await prisma.storeSettings.upsert({
    where: { id: SINGLETON_ID },
    create: {
      id: SINGLETON_ID,
      ...data,
      storeDescription: data.storeDescription || null,
      contactEmail: data.contactEmail || null,
      contactPhone: data.contactPhone || null,
      whatsappNumber: data.whatsappNumber || null,
      instagramUrl: data.instagramUrl || null,
      facebookUrl: data.facebookUrl || null,
      twitterUrl: data.twitterUrl || null,
      logoUrl: data.logoUrl || null,
      logoPublicId: data.logoPublicId || null,
    },
    update: {
      ...data,
      storeDescription: data.storeDescription || null,
      contactEmail: data.contactEmail || null,
      contactPhone: data.contactPhone || null,
      whatsappNumber: data.whatsappNumber || null,
      instagramUrl: data.instagramUrl || null,
      facebookUrl: data.facebookUrl || null,
      twitterUrl: data.twitterUrl || null,
      logoUrl: data.logoUrl || null,
      logoPublicId: data.logoPublicId || null,
    },
  });

  if (previous?.logoPublicId && previous.logoPublicId !== updated.logoPublicId) {
    await destroyCloudinaryAsset(previous.logoPublicId);
  }

  return updated;
}
