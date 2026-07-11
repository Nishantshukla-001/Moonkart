import { z } from "zod";

export const productSchema = z
  .object({
    categoryId: z.uuid("Select a valid category"),
    subCategoryId: z.uuid("Select a valid subcategory").optional().or(z.literal("")),
    brandId: z.uuid("Select a valid brand").optional().or(z.literal("")),
    name: z.string().trim().min(1, "Name is required").max(150, "Must be under 150 characters"),
    slug: z
      .string()
      .trim()
      .min(1, "Slug is required")
      .max(180, "Must be under 180 characters")
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
    shortDescription: z.string().trim().max(200, "Must be under 200 characters").optional().or(z.literal("")),
    description: z.string().trim().max(5000, "Must be under 5000 characters").optional().or(z.literal("")),
    sku: z.string().trim().max(50, "Must be under 50 characters").optional().or(z.literal("")),
    price: z.number().int("Price must be a whole number").positive("Price must be greater than 0"),
    salePrice: z.number().int("Sale price must be a whole number").positive().optional(),
    stock: z.number().int("Stock must be a whole number").min(0, "Stock cannot be negative"),
    weight: z.number().positive("Weight must be greater than 0").optional(),
    dimensions: z.string().trim().max(100, "Must be under 100 characters").optional().or(z.literal("")),
    thumbnail: z.url("Enter a valid thumbnail URL"),
    thumbnailPublicId: z.string().trim().max(300).optional(),
    isFeatured: z.boolean().optional(),
    isBestSeller: z.boolean().optional(),
    isNewArrival: z.boolean().optional(),
    isTrending: z.boolean().optional(),
    isPublished: z.boolean().optional(),
    hasVariants: z.boolean().optional(),
    metaTitle: z.string().trim().max(70, "Must be under 70 characters").optional().or(z.literal("")),
    metaDescription: z
      .string()
      .trim()
      .max(160, "Must be under 160 characters")
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => !data.salePrice || data.salePrice < data.price, {
    message: "Sale price must be lower than the regular price",
    path: ["salePrice"],
  });

export type ProductInput = z.infer<typeof productSchema>;

export const updateProductSchema = z
  .object({
    categoryId: z.uuid("Select a valid category").optional(),
    subCategoryId: z.uuid("Select a valid subcategory").optional().or(z.literal("")),
    brandId: z.uuid("Select a valid brand").optional().or(z.literal("")),
    name: z.string().trim().min(1).max(150).optional(),
    slug: z
      .string()
      .trim()
      .min(1)
      .max(180)
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only")
      .optional(),
    shortDescription: z.string().trim().max(200).optional().or(z.literal("")),
    description: z.string().trim().max(5000).optional().or(z.literal("")),
    sku: z.string().trim().max(50).optional().or(z.literal("")),
    price: z.number().int().positive().optional(),
    salePrice: z.number().int().positive().nullable().optional(),
    stock: z.number().int().min(0).optional(),
    weight: z.number().positive().nullable().optional(),
    dimensions: z.string().trim().max(100).optional().or(z.literal("")),
    thumbnail: z.url("Enter a valid thumbnail URL").optional(),
    thumbnailPublicId: z.string().trim().max(300).optional(),
    isFeatured: z.boolean().optional(),
    isBestSeller: z.boolean().optional(),
    isNewArrival: z.boolean().optional(),
    isTrending: z.boolean().optional(),
    isPublished: z.boolean().optional(),
    hasVariants: z.boolean().optional(),
    metaTitle: z.string().trim().max(70, "Must be under 70 characters").optional().or(z.literal("")),
    metaDescription: z
      .string()
      .trim()
      .max(160, "Must be under 160 characters")
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => !data.salePrice || !data.price || data.salePrice < data.price, {
    message: "Sale price must be lower than the regular price",
    path: ["salePrice"],
  });

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const productImageSchema = z.object({
  imageUrl: z.url("Enter a valid image URL"),
  publicId: z.string().trim().max(300).optional(),
  displayOrder: z.number().int().min(0).optional(),
});

export type ProductImageInput = z.infer<typeof productImageSchema>;

export const updateProductImageSchema = z.object({
  displayOrder: z.number().int().min(0).optional(),
  imageUrl: z.url("Enter a valid image URL").optional(),
  publicId: z.string().trim().max(300).optional(),
});

export type UpdateProductImageInput = z.infer<typeof updateProductImageSchema>;

export const productVariantSchema = z.object({
  size: z.string().trim().max(30, "Must be under 30 characters").optional().or(z.literal("")),
  color: z.string().trim().max(30, "Must be under 30 characters").optional().or(z.literal("")),
  sku: z.string().trim().max(50, "Must be under 50 characters").optional().or(z.literal("")),
  price: z.number().int("Price must be a whole number").positive().optional(),
  salePrice: z.number().int("Sale price must be a whole number").positive().optional(),
  stock: z.number().int("Stock must be a whole number").min(0, "Stock cannot be negative"),
  image: z.url("Enter a valid image URL").optional().or(z.literal("")),
  isDefault: z.boolean().optional(),
});

export type ProductVariantInput = z.infer<typeof productVariantSchema>;

export const updateProductVariantSchema = productVariantSchema.partial();
export type UpdateProductVariantInput = z.infer<typeof updateProductVariantSchema>;
