import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { ProductQuery } from "@/features/products/validation/productQuery.schema";
import type {
  ProductImageInput,
  ProductInput,
  ProductVariantInput,
  UpdateProductImageInput,
  UpdateProductInput,
  UpdateProductVariantInput,
} from "@/features/products/validation/product.schema";
import { LOW_STOCK_THRESHOLD } from "@/features/admin/validation/adminProductQuery.schema";
import type { AdminProductQuery } from "@/features/admin/validation/adminProductQuery.schema";

const publicProductInclude = {
  images: { orderBy: { displayOrder: "asc" as const } },
  variants: true,
  category: true,
  subCategory: true,
  brand: true,
};

function sortToOrderBy(sort: ProductQuery["sort"]): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "price-asc":
      return { price: "asc" };
    case "price-desc":
      return { price: "desc" };
    case "rating":
      return { averageRating: "desc" };
    case "name":
      return { name: "asc" };
    case "newest":
    default:
      return { createdAt: "desc" };
  }
}

export async function getProducts(query: ProductQuery) {
  const where: Prisma.ProductWhereInput = {
    isPublished: true,
    ...(query.category && { category: { slug: query.category } }),
    ...(query.subCategory && { subCategory: { slug: query.subCategory } }),
    ...(query.brand && { brand: { slug: query.brand } }),
    ...(query.search && {
      OR: [
        { name: { contains: query.search, mode: "insensitive" } },
        { shortDescription: { contains: query.search, mode: "insensitive" } },
      ],
    }),
    ...((query.minPrice !== undefined || query.maxPrice !== undefined) && {
      price: {
        ...(query.minPrice !== undefined && { gte: query.minPrice }),
        ...(query.maxPrice !== undefined && { lte: query.maxPrice }),
      },
    }),
    ...((query.size || query.color) && {
      variants: {
        some: {
          ...(query.size && { size: query.size }),
          ...(query.color && { color: query.color }),
        },
      },
    }),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: publicProductInclude,
      orderBy: sortToOrderBy(query.sort),
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items,
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
  };
}

export function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, isPublished: true },
    include: publicProductInclude,
  });
}

export function getRelatedProducts(productId: string, categoryId: string, limit = 8) {
  return prisma.product.findMany({
    where: { categoryId, isPublished: true, id: { not: productId } },
    include: publicProductInclude,
    take: limit,
    orderBy: { createdAt: "desc" },
  });
}

export function getFeaturedProducts(limit = 8) {
  return prisma.product.findMany({
    where: { isPublished: true, isFeatured: true },
    include: publicProductInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export function getNewArrivals(limit = 8) {
  return prisma.product.findMany({
    where: { isPublished: true },
    include: publicProductInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export function getBestSellers(limit = 8) {
  return prisma.product.findMany({
    where: { isPublished: true, isBestSeller: true },
    include: publicProductInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

// --- Admin ---------------------------------------------------------------

export function getProductByIdAdmin(id: string) {
  return prisma.product.findUnique({ where: { id }, include: publicProductInclude });
}

function adminSortToOrderBy(sort: AdminProductQuery["sort"]): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "oldest":
      return { createdAt: "asc" };
    case "name":
      return { name: "asc" };
    case "price-asc":
      return { price: "asc" };
    case "price-desc":
      return { price: "desc" };
    case "stock-asc":
      return { stock: "asc" };
    case "stock-desc":
      return { stock: "desc" };
    case "newest":
    default:
      return { createdAt: "desc" };
  }
}

function adminStockToWhere(stock: AdminProductQuery["stock"]): Prisma.ProductWhereInput {
  switch (stock) {
    case "out-of-stock":
      return { stock: { lte: 0 } };
    case "low-stock":
      return { stock: { gt: 0, lte: LOW_STOCK_THRESHOLD } };
    case "in-stock":
      return { stock: { gt: LOW_STOCK_THRESHOLD } };
    case "all":
    default:
      return {};
  }
}

export function getProductsAdmin(query: Partial<AdminProductQuery> = {}) {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 20;

  const where: Prisma.ProductWhereInput = {
    ...(query.search && {
      OR: [
        { name: { contains: query.search, mode: "insensitive" } },
        { sku: { contains: query.search, mode: "insensitive" } },
      ],
    }),
    ...(query.categoryId && { categoryId: query.categoryId }),
    ...(query.brandId && { brandId: query.brandId }),
    ...(query.status === "published" && { isPublished: true }),
    ...(query.status === "draft" && { isPublished: false }),
    ...adminStockToWhere(query.stock ?? "all"),
  };

  return Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, brand: true, _count: { select: { images: true, variants: true } } },
      orderBy: adminSortToOrderBy(query.sort ?? "newest"),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]).then(([items, total]) => ({
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  }));
}

export function getDashboardProductStats() {
  return Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { stock: { gt: 0, lte: LOW_STOCK_THRESHOLD } } }),
    prisma.product.count({ where: { stock: { lte: 0 } } }),
    prisma.product.findMany({
      include: { category: true, brand: true, _count: { select: { images: true, variants: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.product.findMany({
      where: { stock: { lte: LOW_STOCK_THRESHOLD } },
      include: { category: true, brand: true, _count: { select: { images: true, variants: true } } },
      orderBy: { stock: "asc" },
      take: 5,
    }),
  ]).then(([totalProducts, lowStockCount, outOfStockCount, recentProducts, lowStockProducts]) => ({
    totalProducts,
    lowStockCount,
    outOfStockCount,
    recentProducts,
    lowStockProducts,
  }));
}

export function createProduct(data: ProductInput) {
  return prisma.product.create({
    data: {
      categoryId: data.categoryId,
      subCategoryId: data.subCategoryId || null,
      brandId: data.brandId || null,
      name: data.name,
      slug: data.slug,
      shortDescription: data.shortDescription || null,
      description: data.description || null,
      sku: data.sku || null,
      price: data.price,
      salePrice: data.salePrice ?? null,
      stock: data.stock,
      weight: data.weight ?? null,
      dimensions: data.dimensions || null,
      thumbnail: data.thumbnail,
      isFeatured: data.isFeatured ?? false,
      isBestSeller: data.isBestSeller ?? false,
      isNewArrival: data.isNewArrival ?? false,
      isTrending: data.isTrending ?? false,
      isPublished: data.isPublished ?? true,
      hasVariants: data.hasVariants ?? false,
      metaTitle: data.metaTitle || null,
      metaDescription: data.metaDescription || null,
    },
    include: publicProductInclude,
  });
}

export function updateProduct(id: string, data: UpdateProductInput) {
  return prisma.product.update({
    where: { id },
    data: {
      ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      ...(data.subCategoryId !== undefined && { subCategoryId: data.subCategoryId || null }),
      ...(data.brandId !== undefined && { brandId: data.brandId || null }),
      ...(data.name !== undefined && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.shortDescription !== undefined && { shortDescription: data.shortDescription || null }),
      ...(data.description !== undefined && { description: data.description || null }),
      ...(data.sku !== undefined && { sku: data.sku || null }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.salePrice !== undefined && { salePrice: data.salePrice }),
      ...(data.stock !== undefined && { stock: data.stock }),
      ...(data.weight !== undefined && { weight: data.weight }),
      ...(data.dimensions !== undefined && { dimensions: data.dimensions || null }),
      ...(data.thumbnail !== undefined && { thumbnail: data.thumbnail }),
      ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
      ...(data.isBestSeller !== undefined && { isBestSeller: data.isBestSeller }),
      ...(data.isNewArrival !== undefined && { isNewArrival: data.isNewArrival }),
      ...(data.isTrending !== undefined && { isTrending: data.isTrending }),
      ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
      ...(data.hasVariants !== undefined && { hasVariants: data.hasVariants }),
      ...(data.metaTitle !== undefined && { metaTitle: data.metaTitle || null }),
      ...(data.metaDescription !== undefined && { metaDescription: data.metaDescription || null }),
    },
    include: publicProductInclude,
  });
}

export function deleteProduct(id: string) {
  return prisma.product.delete({ where: { id } });
}

// --- Product images --------------------------------------------------------

export async function addProductImage(productId: string, data: ProductImageInput) {
  const displayOrder =
    data.displayOrder ?? (await prisma.productImage.count({ where: { productId } }));

  return prisma.productImage.create({
    data: { productId, imageUrl: data.imageUrl, displayOrder },
  });
}

export function updateProductImage(id: string, data: UpdateProductImageInput) {
  return prisma.productImage.update({ where: { id }, data: { displayOrder: data.displayOrder } });
}

export function deleteProductImage(id: string) {
  return prisma.productImage.delete({ where: { id } });
}

// --- Product variants --------------------------------------------------------

export function addProductVariant(productId: string, data: ProductVariantInput) {
  return prisma.productVariant.create({
    data: {
      productId,
      size: data.size || null,
      color: data.color || null,
      sku: data.sku || null,
      price: data.price ?? null,
      salePrice: data.salePrice ?? null,
      stock: data.stock,
      image: data.image || null,
      isDefault: data.isDefault ?? false,
    },
  });
}

export function updateProductVariant(id: string, data: UpdateProductVariantInput) {
  return prisma.productVariant.update({
    where: { id },
    data: {
      ...(data.size !== undefined && { size: data.size || null }),
      ...(data.color !== undefined && { color: data.color || null }),
      ...(data.sku !== undefined && { sku: data.sku || null }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.salePrice !== undefined && { salePrice: data.salePrice }),
      ...(data.stock !== undefined && { stock: data.stock }),
      ...(data.image !== undefined && { image: data.image || null }),
      ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
    },
  });
}

export function deleteProductVariant(id: string) {
  return prisma.productVariant.delete({ where: { id } });
}
