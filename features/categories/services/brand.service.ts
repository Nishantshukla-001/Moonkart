import "server-only";

import { cache } from "react";

import { prisma, safeRead } from "@/lib/prisma";
import type { BrandInput, UpdateBrandInput } from "@/features/categories/validation/brand.schema";

/** Called from the build-time sitemap generator (app/sitemap.ts), so a temporarily unreachable database must degrade to an empty list instead of crashing the build — see `safeRead`. */
export function getBrands(options: { includeInactive?: boolean } = {}) {
  return safeRead(
    () =>
      prisma.brand.findMany({
        where: options.includeInactive ? undefined : { isActive: true },
        include: { _count: { select: { products: true } } },
        orderBy: { name: "asc" },
      }),
    [],
    "getBrands"
  );
}

/**
 * Wrapped in `React.cache()` so the brand detail page's `generateMetadata`
 * and page-body render — both calling this with the same slug within one
 * request — share a single query instead of two.
 */
export const getBrandBySlug = cache((slug: string) => {
  return prisma.brand.findUnique({ where: { slug } });
});

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
