"use client";

import { adminApi } from "@/features/admin/services/adminApi";
import type { AdminReviewQuery } from "@/features/reviews/validation/review.schema";
import type { IAdminReviewListItem, IPaginatedAdminReviews } from "@/types/review";

function buildQueryString(query: Partial<AdminReviewQuery>) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const adminReviewService = {
  list: (query: Partial<AdminReviewQuery> = {}) =>
    adminApi.get<IPaginatedAdminReviews>(`/api/admin/reviews${buildQueryString(query)}`),
  setHidden: (id: string, isHidden: boolean) =>
    adminApi.put<IAdminReviewListItem>(`/api/admin/reviews/${id}`, { isHidden }),
  remove: (id: string) => adminApi.delete<null>(`/api/admin/reviews/${id}`),
};
