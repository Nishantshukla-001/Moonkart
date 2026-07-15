"use client";

import { adminApi } from "@/features/admin/services/adminApi";
import type {
  UpdateFeaturedCategoryInput,
  UpdateFeaturedSubCategoryInput,
} from "@/features/homepage/validation/featuredCategory.schema";
import type {
  IFeaturedCategoryWithCategory,
  IFeaturedSubCategoryWithSubCategory,
} from "@/types/featuredCategory";

export const adminFeaturedCategoryService = {
  add: (categoryId: string) =>
    adminApi.post<IFeaturedCategoryWithCategory>("/api/admin/featured-categories", { categoryId }),
  update: (id: string, input: UpdateFeaturedCategoryInput) =>
    adminApi.put<IFeaturedCategoryWithCategory>(`/api/admin/featured-categories/${id}`, input),
  remove: (id: string) => adminApi.delete<null>(`/api/admin/featured-categories/${id}`),
};

export const adminFeaturedSubCategoryService = {
  add: (subCategoryId: string) =>
    adminApi.post<IFeaturedSubCategoryWithSubCategory>("/api/admin/featured-subcategories", {
      subCategoryId,
    }),
  update: (id: string, input: UpdateFeaturedSubCategoryInput) =>
    adminApi.put<IFeaturedSubCategoryWithSubCategory>(`/api/admin/featured-subcategories/${id}`, input),
  remove: (id: string) => adminApi.delete<null>(`/api/admin/featured-subcategories/${id}`),
};
