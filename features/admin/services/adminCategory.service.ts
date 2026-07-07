"use client";

import { adminApi } from "@/features/admin/services/adminApi";
import type { CategoryInput, UpdateCategoryInput } from "@/features/categories/validation/category.schema";
import type { IAdminCategory } from "@/types/admin";

export const adminCategoryService = {
  list: () => adminApi.get<IAdminCategory[]>("/api/admin/categories"),
  create: (input: CategoryInput) => adminApi.post<IAdminCategory>("/api/admin/categories", input),
  update: (id: string, input: UpdateCategoryInput) =>
    adminApi.put<IAdminCategory>(`/api/admin/categories/${id}`, input),
  remove: (id: string) => adminApi.delete<null>(`/api/admin/categories/${id}`),
};
