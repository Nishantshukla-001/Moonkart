import type { Metadata } from "next";

import { ReviewsClient } from "@/features/admin/components/ReviewsClient";
import { getReviewsAdmin } from "@/features/reviews/services/review.service";
import { adminReviewQuerySchema } from "@/features/reviews/validation/review.schema";

export const metadata: Metadata = { title: "Reviews" };

interface AdminReviewsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminReviewsPage({ searchParams }: AdminReviewsPageProps) {
  const rawParams = await searchParams;
  const query = adminReviewQuerySchema.parse(rawParams);

  const result = await getReviewsAdmin(query);

  return <ReviewsClient result={result} query={query} />;
}
