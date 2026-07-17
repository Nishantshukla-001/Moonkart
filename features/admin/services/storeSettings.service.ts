import "server-only";

import type { StoreSettings } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { destroyCloudinaryAsset } from "@/lib/cloudinary";
import type { StoreSettingsInput } from "@/features/admin/validation/storeSettings.schema";

const SINGLETON_ID = "singleton";

/**
 * Mirrors the Prisma schema's own `@default(...)` values. Returned in place
 * of the database row when the singleton hasn't been created yet, so every
 * page that reads store settings — including the root layout, which wraps
 * every route — never has to write to the database just to render.
 */
const DEFAULT_STORE_SETTINGS: StoreSettings = {
  id: SINGLETON_ID,
  storeName: "MoonKart",
  storeDescription: null,
  contactEmail: null,
  contactPhone: null,
  whatsappNumber: null,
  instagramUrl: null,
  facebookUrl: null,
  twitterUrl: null,
  logoUrl: null,
  logoPublicId: null,
  currencyCode: "INR",
  currencySymbol: "₹",
  shippingFlatRate: null,
  freeShippingThreshold: null,
  taxPercent: null,
  updatedAt: new Date(0),
};

/**
 * Read-only — never writes. Falls back to in-memory schema defaults until an
 * admin explicitly saves the store settings form (see updateStoreSettings
 * below, which is the only place this row is ever created), so no page
 * render can trigger a database write.
 */
export async function getStoreSettings(): Promise<StoreSettings> {
  const settings = await prisma.storeSettings.findUnique({ where: { id: SINGLETON_ID } });
  return settings ?? DEFAULT_STORE_SETTINGS;
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
