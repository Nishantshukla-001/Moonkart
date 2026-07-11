import { z } from "zod";

export const reviewImageInputSchema = z.object({
  imageUrl: z.url("Enter a valid image URL"),
  publicId: z.string().trim().max(300).optional(),
});

export const reviewSchema = z.object({
  rating: z.number().int("Rating must be a whole number").min(1, "Rating is required").max(5, "Rating must be 1-5"),
  title: z.string().trim().min(1, "Title is required").max(120, "Must be under 120 characters"),
  comment: z.string().trim().min(1, "Review text is required").max(2000, "Must be under 2000 characters"),
  images: z.array(reviewImageInputSchema).max(6, "Up to 6 images").optional(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

export const updateReviewSchema = reviewSchema.partial();
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;

export const reviewSortSchema = z.enum(["newest", "highest", "lowest"]).default("newest");
export type ReviewSort = z.infer<typeof reviewSortSchema>;

export const reviewQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  sort: reviewSortSchema,
});
export type ReviewQuery = z.infer<typeof reviewQuerySchema>;

export const adminReviewQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(150).optional().or(z.literal("")),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  visibility: z.enum(["all", "visible", "hidden"]).default("all"),
  sort: reviewSortSchema,
});
export type AdminReviewQuery = z.infer<typeof adminReviewQuerySchema>;
