import "server-only";

import { prisma } from "@/lib/prisma";
import type { BrandInput, UpdateBrandInput } from "@/features/categories/validation/brand.schema";

export function getBrands(options: { includeInactive?: boolean } = {}) {
  return prisma.brand.findMany({
    where: options.includeInactive ? undefined : { isActive: true },
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
}

export function getBrandBySlug(slug: string) {
  return prisma.brand.findUnique({ where: { slug } });
}

const adminBrandInclude = { _count: { select: { products: true } } } as const;

export function createBrand(data: BrandInput) {
  return prisma.brand.create({
    data: {
      name: data.name,
      slug: data.slug,
      logo: data.logo || null,
      description: data.description || null,
      isActive: data.isActive ?? true,
    },
    include: adminBrandInclude,
  });
}

export function updateBrand(id: string, data: UpdateBrandInput) {
  return prisma.brand.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.logo !== undefined && { logo: data.logo || null }),
      ...(data.description !== undefined && { description: data.description || null }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
    include: adminBrandInclude,
  });
}

export async function brandHasProducts(id: string) {
  const count = await prisma.product.count({ where: { brandId: id } });
  return count > 0;
}

export function deleteBrand(id: string) {
  return prisma.brand.delete({ where: { id } });
}
