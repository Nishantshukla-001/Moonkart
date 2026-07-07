import { z } from "zod";

export const productSortSchema = z
  .enum(["newest", "price-asc", "price-desc", "rating", "name"])
  .default("newest");

export type ProductSort = z.infer<typeof productSortSchema>;

export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(48).default(12),
  category: z.string().trim().optional(),
  subCategory: z.string().trim().optional(),
  brand: z.string().trim().optional(),
  search: z.string().trim().max(100).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  size: z.string().trim().optional(),
  color: z.string().trim().optional(),
  sort: productSortSchema,
});

export type ProductQuery = z.infer<typeof productQuerySchema>;
