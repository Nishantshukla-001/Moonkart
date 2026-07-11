import { z } from "zod";

export const placeOrderSchema = z.object({
  addressId: z.uuid("Select a shipping address"),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;

export const orderStatusSchema = z.enum([
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
]);

export type OrderStatusValue = z.infer<typeof orderStatusSchema>;

export const updateOrderStatusSchema = z.object({
  status: orderStatusSchema,
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

export const adminOrderSortSchema = z.enum(["newest", "oldest", "total-asc", "total-desc"]).default("newest");
export type AdminOrderSort = z.infer<typeof adminOrderSortSchema>;

export const adminOrderQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(150).optional().or(z.literal("")),
  status: z.union([orderStatusSchema, z.literal("all")]).default("all"),
  sort: adminOrderSortSchema,
});

export type AdminOrderQuery = z.infer<typeof adminOrderQuerySchema>;
