"use client";

import { adminApi } from "@/features/admin/services/adminApi";
import type {
  SubCategoryInput,
  UpdateSubCategoryInput,
} from "@/features/categories/validation/subCategory.schema";
import type { IAdminSubCategory } from "@/types/admin";

export const adminSubCategoryService = {
  list: (categoryId?: string) =>
    adminApi.get<IAdminSubCategory[]>(
      categoryId ? `/api/admin/subcategories?categoryId=${categoryId}` : "/api/admin/subcategories"
    ),
  create: (input: SubCategoryInput) => adminApi.post<IAdminSubCategory>("/api/admin/subcategories", input),
  update: (id: string, input: UpdateSubCategoryInput) =>
    adminApi.put<IAdminSubCategory>(`/api/admin/subcategories/${id}`, input),
  remove: (id: string) => adminApi.delete<null>(`/api/admin/subcategories/${id}`),
};
