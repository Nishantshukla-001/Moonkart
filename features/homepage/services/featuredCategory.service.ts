import "server-only";

import { prisma } from "@/lib/prisma";
import type {
  UpdateFeaturedCategoryInput,
  UpdateFeaturedSubCategoryInput,
} from "@/features/homepage/validation/featuredCategory.schema";

// --- Featured Categories (homepage "Featured Categories" grid) -------------

/**
 * Storefront query — visible entries only, and only for categories still
 * active. Includes each category's active subcategories so the homepage
 * grid can render subcategory chips under categories that have them.
 */
export function getFeaturedCategoriesForHomepage(limit = 6) {
  return prisma.featuredCategory.findMany({
    where: { isVisible: true, category: { isActive: true } },
    include: {
      category: {
        include: { subCategories: { where: { isActive: true }, orderBy: { name: "asc" } } },
      },
    },
    orderBy: { displayOrder: "asc" },
    take: limit,
  });
}

export function getFeaturedCategoriesAdmin() {
  return prisma.featuredCategory.findMany({
    include: { category: true },
    orderBy: { displayOrder: "asc" },
  });
}

/** Active categories not yet added to the homepage grid — powers the admin "Add" picker. */
export async function getAvailableCategoriesForFeature() {
  const featured = await prisma.featuredCategory.findMany({ select: { categoryId: true } });
  return prisma.category.findMany({
    where: { isActive: true, id: { notIn: featured.map((row) => row.categoryId) } },
    orderBy: { name: "asc" },
  });
}

export async function addFeaturedCategory(categoryId: string) {
  const last = await prisma.featuredCategory.findFirst({ orderBy: { displayOrder: "desc" } });
  const displayOrder = last ? last.displayOrder + 1 : 0;

  return prisma.featuredCategory.create({
    data: { categoryId, displayOrder },
    include: { category: true },
  });
}

export function updateFeaturedCategory(id: string, data: UpdateFeaturedCategoryInput) {
  return prisma.featuredCategory.update({ where: { id }, data, include: { category: true } });
}

export function removeFeaturedCategory(id: string) {
  return prisma.featuredCategory.delete({ where: { id } });
}

// --- Featured Subcategories (homepage "Moon Essentials" grid) --------------

/** Storefront query — includes the subcategory's parent category so the card can link to `/categories/[parent]?subCategory=[slug]`. */
export function getFeaturedSubCategoriesForHomepage(limit = 8) {
  return prisma.featuredSubCategory.findMany({
    where: { isVisible: true, subCategory: { isActive: true } },
    include: { subCategory: { include: { category: true } } },
    orderBy: { displayOrder: "asc" },
    take: limit,
  });
}

export function getFeaturedSubCategoriesAdmin() {
  return prisma.featuredSubCategory.findMany({
    include: { subCategory: true },
    orderBy: { displayOrder: "asc" },
  });
}

export async function getAvailableSubCategoriesForFeature() {
  const featured = await prisma.featuredSubCategory.findMany({ select: { subCategoryId: true } });
  return prisma.subCategory.findMany({
    where: { isActive: true, id: { notIn: featured.map((row) => row.subCategoryId) } },
    include: { category: true },
    orderBy: { name: "asc" },
  });
}

export async function addFeaturedSubCategory(subCategoryId: string) {
  const last = await prisma.featuredSubCategory.findFirst({ orderBy: { displayOrder: "desc" } });
  const displayOrder = last ? last.displayOrder + 1 : 0;

  return prisma.featuredSubCategory.create({
    data: { subCategoryId, displayOrder },
    include: { subCategory: true },
  });
}

export function updateFeaturedSubCategory(id: string, data: UpdateFeaturedSubCategoryInput) {
  return prisma.featuredSubCategory.update({ where: { id }, data, include: { subCategory: true } });
}

export function removeFeaturedSubCategory(id: string) {
  return prisma.featuredSubCategory.delete({ where: { id } });
}
