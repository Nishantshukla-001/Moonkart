"use client";

import { LayoutGrid } from "lucide-react";
import type { Category } from "@prisma/client";

import { HomepageEntityOrderManager, type OrderableItem } from "@/features/admin/components/HomepageEntityOrderManager";
import { adminFeaturedCategoryService } from "@/features/admin/services/adminFeaturedCategory.service";
import type { ApiResponse } from "@/features/admin/services/adminApi";
import type { IFeaturedCategoryWithCategory } from "@/types/featuredCategory";

interface FeaturedCategoryItem extends OrderableItem {
  categoryId: string;
}

function toOrderableItem(featured: IFeaturedCategoryWithCategory): FeaturedCategoryItem {
  return {
    id: featured.id,
    displayOrder: featured.displayOrder,
    isVisible: featured.isVisible,
    name: featured.category.name,
    image: featured.category.image,
    categoryId: featured.categoryId,
  };
}

function toItemResponse(response: ApiResponse<IFeaturedCategoryWithCategory>): ApiResponse<FeaturedCategoryItem> {
  return { ...response, data: response.data ? toOrderableItem(response.data) : undefined };
}

interface FeaturedCategoriesManagerProps {
  initialFeatured: IFeaturedCategoryWithCategory[];
  availableCategories: Category[];
}

export function FeaturedCategoriesManager({ initialFeatured, availableCategories }: FeaturedCategoriesManagerProps) {
  return (
    <HomepageEntityOrderManager<FeaturedCategoryItem>
      initialItems={initialFeatured.map(toOrderableItem)}
      availableOptions={availableCategories.map((category) => ({ id: category.id, name: category.name }))}
      addPlaceholder="Select a category to add…"
      emptyIcon={LayoutGrid}
      emptyTitle="No categories featured yet"
      emptyDescription="Add categories above to show them in the homepage's Featured Categories section."
      onAdd={async (categoryId) => toItemResponse(await adminFeaturedCategoryService.add(categoryId))}
      onUpdate={async (id, data) => toItemResponse(await adminFeaturedCategoryService.update(id, data))}
      onRemove={(id) => adminFeaturedCategoryService.remove(id)}
    />
  );
}
