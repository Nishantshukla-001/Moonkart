import { z } from "zod";

export const instagramPostInputSchema = z.object({
  imageUrl: z.url("Enter a valid image URL"),
  publicId: z.string().trim().max(300).optional(),
});

export type InstagramPostInput = z.infer<typeof instagramPostInputSchema>;

export const updateInstagramPostSchema = z.object({
  imageUrl: z.url("Enter a valid image URL").optional(),
  publicId: z.string().trim().max(300).optional(),
  displayOrder: z.number().int().min(0).optional(),
  isVisible: z.boolean().optional(),
});

export type UpdateInstagramPostInput = z.infer<typeof updateInstagramPostSchema>;
