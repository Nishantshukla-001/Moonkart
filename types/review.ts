import type { Review, ReviewImage } from "@prisma/client";

export type IReview = Review;
export type IReviewImage = ReviewImage;

export interface IReviewWithRelations extends IReview {
  images: IReviewImage[];
  user: { firstName: string; lastName: string };
}

export interface IPaginatedReviews {
  items: IReviewWithRelations[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface IAdminReviewListItem extends IReview {
  images: IReviewImage[];
  user: { firstName: string; lastName: string; email: string };
  product: { name: string; slug: string; thumbnail: string };
}

export interface IPaginatedAdminReviews {
  items: IAdminReviewListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface IRatingBreakdown {
  average: number;
  total: number;
  counts: Record<1 | 2 | 3 | 4 | 5, number>;
}
