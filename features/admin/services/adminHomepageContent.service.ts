"use client";

import { adminApi } from "@/features/admin/services/adminApi";
import type { HomepageContentInput } from "@/features/homepage/validation/homepageContent.schema";
import type { IHomepageContent } from "@/types/homepageContent";

export const adminHomepageContentService = {
  get: () => adminApi.get<IHomepageContent>("/api/admin/homepage-content"),
  update: (input: HomepageContentInput) =>
    adminApi.put<IHomepageContent>("/api/admin/homepage-content", input),
};
