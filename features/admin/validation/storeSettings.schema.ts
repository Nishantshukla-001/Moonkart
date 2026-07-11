import { z } from "zod";

export const storeSettingsInputSchema = z.object({
  storeName: z.string().trim().min(1, "Store name is required").max(100),
  storeDescription: z.string().trim().max(500).optional().or(z.literal("")),
  contactEmail: z.email("Enter a valid email").optional().or(z.literal("")),
  contactPhone: z.string().trim().max(20).optional().or(z.literal("")),
  whatsappNumber: z.string().trim().max(20).optional().or(z.literal("")),
  instagramUrl: z.url("Enter a valid URL").optional().or(z.literal("")),
  facebookUrl: z.url("Enter a valid URL").optional().or(z.literal("")),
  twitterUrl: z.url("Enter a valid URL").optional().or(z.literal("")),
  logoUrl: z.string().optional().or(z.literal("")),
  logoPublicId: z.string().optional().or(z.literal("")),
  currencyCode: z.string().trim().min(1).max(10),
  currencySymbol: z.string().trim().min(1).max(5),
  shippingFlatRate: z.number().int().nonnegative().nullable(),
  freeShippingThreshold: z.number().int().nonnegative().nullable(),
  taxPercent: z.number().nonnegative().max(100).nullable(),
});

export type StoreSettingsInput = z.infer<typeof storeSettingsInputSchema>;
