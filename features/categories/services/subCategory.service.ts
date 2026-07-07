import "server-only";

import { prisma } from "@/lib/prisma";
import type {
  SubCategoryInput,
  UpdateSubCategoryInput,
} from "@/features/categories/validation/subCategory.schema";

export function getSubCategories(options: { categoryId?: string; includeInactive?: boolean } = {}) {
  return prisma.subCategory.findMany({
    where: {
      ...(options.categoryId && { categoryId: options.categoryId }),
      ...(!options.includeInactive && { isActive: true }),
    },
    include: { category: true, _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
}

export function getSubCategoryBySlug(slug: string) {
  return prisma.subCategory.findUnique({
    where: { slug },
    include: { category: true },
  });
}

const adminSubCategoryInclude = { category: true, _count: { select: { products: true } } } as const;

export function createSubCategory(data: SubCategoryInput) {
  return prisma.subCategory.create({
    data: {
      categoryId: data.categoryId,
      name: data.name,
      slug: data.slug,
      image: data.image || null,
      description: data.description || null,
      isActive: data.isActive ?? true,
    },
    include: adminSubCategoryInclude,
  });
}

export function updateSubCategory(id: string, data: UpdateSubCategoryInput) {
  return prisma.subCategory.update({
    where: { id },
    data: {
      ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      ...(data.name !== undefined && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.image !== undefined && { image: data.image || null }),
      ...(data.description !== undefined && { description: data.description || null }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
    include: adminSubCategoryInclude,
  });
}

export async function subCategoryHasProducts(id: string) {
  const count = await prisma.product.count({ where: { subCategoryId: id } });
  return count > 0;
}

export function deleteSubCategory(id: string) {
  return prisma.subCategory.delete({ where: { id } });
}
