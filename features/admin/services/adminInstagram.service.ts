"use client";

import { adminApi } from "@/features/admin/services/adminApi";
import type {
  InstagramPostInput,
  UpdateInstagramPostInput,
} from "@/features/instagram/validation/instagramPost.schema";
import type { IInstagramPost } from "@/types/instagram";

export const adminInstagramService = {
  list: () => adminApi.get<IInstagramPost[]>("/api/admin/instagram-posts"),
  create: (input: InstagramPostInput) =>
    adminApi.post<IInstagramPost>("/api/admin/instagram-posts", input),
  update: (id: string, input: UpdateInstagramPostInput) =>
    adminApi.put<IInstagramPost>(`/api/admin/instagram-posts/${id}`, input),
  remove: (id: string) => adminApi.delete<null>(`/api/admin/instagram-posts/${id}`),
};
