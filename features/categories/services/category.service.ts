import "server-only";

import { prisma } from "@/lib/prisma";
import type { CategoryInput, UpdateCategoryInput } from "@/features/categories/validation/category.schema";

export function getCategories(options: { includeInactive?: boolean } = {}) {
  return prisma.category.findMany({
    where: options.includeInactive ? undefined : { isActive: true },
    include: {
      subCategories: { where: { isActive: true }, orderBy: { name: "asc" } },
      _count: { select: { products: true } },
    },
    orderBy: { name: "asc" },
  });
}

/**
 * Admin variant of `getCategories` — the public one deliberately filters
 * nested `subCategories` to active-only (correct for the storefront), which
 * would under-count subcategories in the admin table. This returns the true
 * totals via `_count` instead of a filtered array.
 */
export function getCategoriesAdmin() {
  return prisma.category.findMany({
    include: adminCategoryInclude,
    orderBy: { name: "asc" },
  });
}

export function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: { subCategories: { where: { isActive: true } } },
  });
}

const adminCategoryInclude = {
  subCategories: true,
  _count: { select: { products: true, subCategories: true } },
} as const;

export function createCategory(data: CategoryInput) {
  return prisma.category.create({
    data: {
      name: data.name,
      slug: data.slug,
      image: data.image || null,
      description: data.description || null,
      isActive: data.isActive ?? true,
    },
    include: adminCategoryInclude,
  });
}

export function updateCategory(id: string, data: UpdateCategoryInput) {
  return prisma.category.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.image !== undefined && { image: data.image || null }),
      ...(data.description !== undefined && { description: data.description || null }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
    include: adminCategoryInclude,
  });
}

export async function categoryHasProducts(id: string) {
  const count = await prisma.product.count({ where: { categoryId: id } });
  return count > 0;
}

export function deleteCategory(id: string) {
  return prisma.category.delete({ where: { id } });
}
