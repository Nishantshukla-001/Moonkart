"use client";

import { Layers } from "lucide-react";
import type { SubCategory } from "@prisma/client";

import { HomepageEntityOrderManager, type OrderableItem } from "@/features/admin/components/HomepageEntityOrderManager";
import { adminFeaturedSubCategoryService } from "@/features/admin/services/adminFeaturedCategory.service";
import type { ApiResponse } from "@/features/admin/services/adminApi";
import type { IFeaturedSubCategoryWithSubCategory } from "@/types/featuredCategory";

interface FeaturedSubCategoryItem extends OrderableItem {
  subCategoryId: string;
}

function toOrderableItem(featured: IFeaturedSubCategoryWithSubCategory): FeaturedSubCategoryItem {
  return {
    id: featured.id,
    displayOrder: featured.displayOrder,
    isVisible: featured.isVisible,
    name: featured.subCategory.name,
    image: featured.subCategory.image,
    subCategoryId: featured.subCategoryId,
  };
}

function toItemResponse(
  response: ApiResponse<IFeaturedSubCategoryWithSubCategory>
): ApiResponse<FeaturedSubCategoryItem> {
  return { ...response, data: response.data ? toOrderableItem(response.data) : undefined };
}

interface FeaturedSubCategoriesManagerProps {
  initialFeatured: IFeaturedSubCategoryWithSubCategory[];
  availableSubCategories: (SubCategory & { category: { name: string } })[];
}

export function FeaturedSubCategoriesManager({
  initialFeatured,
  availableSubCategories,
}: FeaturedSubCategoriesManagerProps) {
  return (
    <HomepageEntityOrderManager<FeaturedSubCategoryItem>
      initialItems={initialFeatured.map(toOrderableItem)}
      availableOptions={availableSubCategories.map((subCategory) => ({
        id: subCategory.id,
        name: `${subCategory.name} (${subCategory.category.name})`,
      }))}
      addPlaceholder="Select a subcategory to add…"
      emptyIcon={Layers}
      emptyTitle="No subcategories featured yet"
      emptyDescription="Add subcategories above to show them in the homepage's Moon Essentials section."
      onAdd={async (subCategoryId) => toItemResponse(await adminFeaturedSubCategoryService.add(subCategoryId))}
      onUpdate={async (id, data) => toItemResponse(await adminFeaturedSubCategoryService.update(id, data))}
      onRemove={(id) => adminFeaturedSubCategoryService.remove(id)}
    />
  );
}
