import { z } from "zod";

export const adminProductStatusSchema = z.enum(["all", "published", "draft"]).default("all");
export type AdminProductStatus = z.infer<typeof adminProductStatusSchema>;

export const adminProductStockSchema = z
  .enum(["all", "in-stock", "low-stock", "out-of-stock"])
  .default("all");
export type AdminProductStock = z.infer<typeof adminProductStockSchema>;

export const adminProductSortSchema = z
  .enum(["newest", "oldest", "name", "price-asc", "price-desc", "stock-asc", "stock-desc"])
  .default("newest");
export type AdminProductSort = z.infer<typeof adminProductSortSchema>;

export const adminProductQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(150).optional().or(z.literal("")),
  categoryId: z.uuid().optional().or(z.literal("")),
  brandId: z.uuid().optional().or(z.literal("")),
  status: adminProductStatusSchema,
  stock: adminProductStockSchema,
  sort: adminProductSortSchema,
});

export type AdminProductQuery = z.infer<typeof adminProductQuerySchema>;

/** Products at or below this stock count (but above 0) are flagged "Low Stock". */
export const LOW_STOCK_THRESHOLD = 10;
