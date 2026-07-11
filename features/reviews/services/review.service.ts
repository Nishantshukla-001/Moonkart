import "server-only";

import type { Prisma } from "@prisma/client";

import { destroyCloudinaryAsset } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import type {
  AdminReviewQuery,
  ReviewInput,
  ReviewQuery,
  UpdateReviewInput,
} from "@/features/reviews/validation/review.schema";
import type { IReviewWithRelations } from "@/types/review";

const reviewInclude = {
  images: true,
  user: { select: { firstName: true, lastName: true } },
};

function sortToOrderBy(sort: ReviewQuery["sort"]): Prisma.ReviewOrderByWithRelationInput[] {
  switch (sort) {
    case "highest":
      return [{ rating: "desc" }, { createdAt: "desc" }];
    case "lowest":
      return [{ rating: "asc" }, { createdAt: "desc" }];
    case "newest":
    default:
      return [{ createdAt: "desc" }];
  }
}

/** Recomputes the cached `averageRating`/`reviewCount` on Product from its non-hidden reviews. Must run in the same transaction as any review create/update/delete/hide so the two never drift. */
async function recomputeProductRating(tx: Prisma.TransactionClient, productId: string) {
  const agg = await tx.review.aggregate({
    where: { productId, isHidden: false },
    _avg: { rating: true },
    _count: true,
  });
  await tx.product.update({
    where: { id: productId },
    data: { averageRating: agg._avg.rating ?? 0, reviewCount: agg._count },
  });
}

async function hasPurchased(userId: string, productId: string) {
  const count = await prisma.orderItem.count({
    where: { productId, order: { userId, status: { not: "CANCELLED" } } },
  });
  return count > 0;
}

export function getReviewsForProduct(productId: string, query: ReviewQuery) {
  const where: Prisma.ReviewWhereInput = { productId, isHidden: false };

  return Promise.all([
    prisma.review.findMany({
      where,
      include: reviewInclude,
      orderBy: sortToOrderBy(query.sort),
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.review.count({ where }),
  ]).then(([items, total]) => ({
    items,
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
  }));
}

export async function getRatingBreakdown(productId: string) {
  const reviews = await prisma.review.findMany({
    where: { productId, isHidden: false },
    select: { rating: true },
  });

  const counts: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const review of reviews) {
    const rating = Math.min(5, Math.max(1, Math.round(review.rating))) as 1 | 2 | 3 | 4 | 5;
    counts[rating] += 1;
  }

  const total = reviews.length;
  const average = total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;

  return { average, total, counts };
}

/** Whether `userId` may review `productId` — purchased it and hasn't already reviewed it. */
export async function getReviewEligibility(userId: string, productId: string) {
  const [purchased, existing] = await Promise.all([
    hasPurchased(userId, productId),
    prisma.review.findUnique({ where: { userId_productId: { userId, productId } }, include: reviewInclude }),
  ]);

  return { canReview: purchased && !existing, hasPurchased: purchased, existingReview: existing };
}

export type CreateReviewResult =
  | { success: true; review: IReviewWithRelations }
  | { success: false; error: string };

export async function createReview(userId: string, productId: string, input: ReviewInput): Promise<CreateReviewResult> {
  const purchased = await hasPurchased(userId, productId);
  if (!purchased) return { success: false, error: "You can only review products you've purchased." };

  const existing = await prisma.review.findUnique({ where: { userId_productId: { userId, productId } } });
  if (existing) return { success: false, error: "You've already reviewed this product." };

  const review = await prisma.$transaction(async (tx) => {
    const created = await tx.review.create({
      data: {
        userId,
        productId,
        rating: input.rating,
        title: input.title,
        comment: input.comment,
        isVerifiedPurchase: true,
        images: input.images?.length
          ? { createMany: { data: input.images.map((image) => ({ imageUrl: image.imageUrl, publicId: image.publicId || null })) } }
          : undefined,
      },
      include: reviewInclude,
    });
    await recomputeProductRating(tx, productId);
    return created;
  });

  return { success: true, review };
}

/** Scoped to `userId` so one customer can never edit another's review. */
export async function updateReview(userId: string, reviewId: string, input: UpdateReviewInput) {
  const existing = await prisma.review.findFirst({ where: { id: reviewId, userId }, include: { images: true } });
  if (!existing) return null;

  const incomingImages = input.images;
  const removedImages = incomingImages ? existing.images.filter((img) => !incomingImages.some((i) => i.publicId === img.publicId)) : [];

  const updated = await prisma.$transaction(async (tx) => {
    if (incomingImages) {
      await tx.reviewImage.deleteMany({ where: { reviewId } });
    }

    const result = await tx.review.update({
      where: { id: reviewId },
      data: {
        ...(input.rating !== undefined && { rating: input.rating }),
        ...(input.title !== undefined && { title: input.title }),
        ...(input.comment !== undefined && { comment: input.comment }),
        ...(incomingImages && {
          images: {
            createMany: { data: incomingImages.map((image) => ({ imageUrl: image.imageUrl, publicId: image.publicId || null })) },
          },
        }),
      },
      include: reviewInclude,
    });

    if (input.rating !== undefined) await recomputeProductRating(tx, existing.productId);
    return result;
  });

  await Promise.all(removedImages.map((image) => (image.publicId ? destroyCloudinaryAsset(image.publicId) : null)));

  return updated;
}

export async function deleteReviewAsOwner(userId: string, reviewId: string) {
  const existing = await prisma.review.findFirst({ where: { id: reviewId, userId }, include: { images: true } });
  if (!existing) return false;
  await deleteReviewInternal(existing);
  return true;
}

async function deleteReviewInternal(review: { id: string; productId: string; images: { publicId: string | null }[] }) {
  await prisma.$transaction(async (tx) => {
    await tx.review.delete({ where: { id: review.id } });
    await recomputeProductRating(tx, review.productId);
  });
  await Promise.all(review.images.map((image) => (image.publicId ? destroyCloudinaryAsset(image.publicId) : null)));
}

// --- Admin -------------------------------------------------------------

export async function getReviewsAdmin(query: AdminReviewQuery) {
  const where: Prisma.ReviewWhereInput = {
    ...(query.rating && { rating: query.rating }),
    ...(query.visibility === "visible" && { isHidden: false }),
    ...(query.visibility === "hidden" && { isHidden: true }),
    ...(query.search && {
      OR: [
        { title: { contains: query.search, mode: "insensitive" } },
        { comment: { contains: query.search, mode: "insensitive" } },
        { product: { name: { contains: query.search, mode: "insensitive" } } },
        { user: { email: { contains: query.search, mode: "insensitive" } } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        ...reviewInclude,
        user: { select: { firstName: true, lastName: true, email: true } },
        product: { select: { name: true, slug: true, thumbnail: true } },
      },
      orderBy: sortToOrderBy(query.sort),
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.review.count({ where }),
  ]);

  return { items, total, page: query.page, pageSize: query.pageSize, totalPages: Math.max(1, Math.ceil(total / query.pageSize)) };
}

export async function setReviewHidden(reviewId: string, isHidden: boolean) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) return null;

  return prisma.$transaction(async (tx) => {
    const updated = await tx.review.update({ where: { id: reviewId }, data: { isHidden }, include: reviewInclude });
    await recomputeProductRating(tx, review.productId);
    return updated;
  });
}

export async function deleteReviewAsAdmin(reviewId: string) {
  const existing = await prisma.review.findUnique({ where: { id: reviewId }, include: { images: true } });
  if (!existing) return false;
  await deleteReviewInternal(existing);
  return true;
}

/** No pre-publish approval queue exists (reviews go live immediately) — "pending moderation" means still-visible, low-rated reviews that likely warrant an admin look. */
export function getReviewsPendingModerationCount() {
  return prisma.review.count({ where: { isHidden: false, rating: { lte: 2 } } });
}
