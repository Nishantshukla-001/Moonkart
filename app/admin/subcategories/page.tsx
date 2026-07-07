import type { Metadata } from "next";

import { SubCategoriesClient } from "@/features/admin/components/SubCategoriesClient";
import { getCategories } from "@/features/categories/services/category.service";
import { getSubCategories } from "@/features/categories/services/subCategory.service";

export const metadata: Metadata = { title: "Subcategories" };

export default async function AdminSubCategoriesPage() {
  const [subCategories, categories] = await Promise.all([
    getSubCategories({ includeInactive: true }),
    getCategories({ includeInactive: true }),
  ]);

  return <SubCategoriesClient initialSubCategories={subCategories} categories={categories} />;
}
