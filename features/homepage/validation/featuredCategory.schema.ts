import { z } from "zod";

export const addFeaturedCategorySchema = z.object({
  categoryId: z.uuid("Select a category"),
});
export type AddFeaturedCategoryInput = z.infer<typeof addFeaturedCategorySchema>;

export const updateFeaturedCategorySchema = z.object({
  displayOrder: z.number().int().min(0).optional(),
  isVisible: z.boolean().optional(),
});
export type UpdateFeaturedCategoryInput = z.infer<typeof updateFeaturedCategorySchema>;

export const addFeaturedSubCategorySchema = z.object({
  subCategoryId: z.uuid("Select a subcategory"),
});
export type AddFeaturedSubCategoryInput = z.infer<typeof addFeaturedSubCategorySchema>;

export const updateFeaturedSubCategorySchema = z.object({
  displayOrder: z.number().int().min(0).optional(),
  isVisible: z.boolean().optional(),
});
export type UpdateFeaturedSubCategoryInput = z.infer<typeof updateFeaturedSubCategorySchema>;
