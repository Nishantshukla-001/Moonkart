import { z } from "zod";

export const subCategorySchema = z.object({
  categoryId: z.uuid("Select a valid category"),
  name: z.string().trim().min(1, "Name is required").max(80, "Must be under 80 characters"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(100, "Must be under 100 characters")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
  image: z.url("Enter a valid image URL").optional().or(z.literal("")),
  description: z.string().trim().max(500, "Must be under 500 characters").optional().or(z.literal("")),
  isActive: z.boolean().optional(),
});

export type SubCategoryInput = z.infer<typeof subCategorySchema>;

export const updateSubCategorySchema = subCategorySchema.partial();
export type UpdateSubCategoryInput = z.infer<typeof updateSubCategorySchema>;
