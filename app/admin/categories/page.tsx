import type { Metadata } from "next";

import { CategoriesClient } from "@/features/admin/components/CategoriesClient";
import { getCategoriesAdmin } from "@/features/categories/services/category.service";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  const categories = await getCategoriesAdmin();
  return <CategoriesClient initialCategories={categories} />;
}
