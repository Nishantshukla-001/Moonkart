"use client";

import { adminApi } from "@/features/admin/services/adminApi";
import type { BrandInput, UpdateBrandInput } from "@/features/categories/validation/brand.schema";
import type { IAdminBrand } from "@/types/admin";

export const adminBrandService = {
  list: () => adminApi.get<IAdminBrand[]>("/api/admin/brands"),
  create: (input: BrandInput) => adminApi.post<IAdminBrand>("/api/admin/brands", input),
  update: (id: string, input: UpdateBrandInput) => adminApi.put<IAdminBrand>(`/api/admin/brands/${id}`, input),
  remove: (id: string) => adminApi.delete<null>(`/api/admin/brands/${id}`),
};
