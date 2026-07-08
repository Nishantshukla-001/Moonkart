import { z } from "zod";

import { emailSchema, nameSchema, phoneSchema } from "@/lib/validations";

export const addressTypeSchema = z.enum(["HOME", "WORK", "OTHER"]);

export const addressSchema = z.object({
  fullName: nameSchema,
  phone: phoneSchema,
  email: emailSchema,
  addressLine1: z.string().trim().min(1, "House/Flat/Street is required").max(200),
  addressLine2: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().min(1, "City is required").max(100),
  state: z.string().trim().min(1, "State is required").max(100),
  country: z.string().trim().min(1, "Country is required").max(100),
  postalCode: z
    .string()
    .trim()
    .min(4, "Enter a valid PIN code")
    .max(10, "Enter a valid PIN code")
    .regex(/^[\dA-Za-z\s-]+$/, "Enter a valid PIN code"),
  addressType: addressTypeSchema,
  isDefault: z.boolean().optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;

export const updateAddressSchema = addressSchema.partial();

export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
