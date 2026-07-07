"use client";

import { adminApi } from "@/features/admin/services/adminApi";
import type {
  ProductImageInput,
  ProductInput,
  ProductVariantInput,
  UpdateProductImageInput,
  UpdateProductInput,
  UpdateProductVariantInput,
} from "@/features/products/validation/product.schema";
import type { AdminProductQuery } from "@/features/admin/validation/adminProductQuery.schema";
import type { IAdminProductListResult } from "@/types/admin";
import type { IProductImage, IProductVariant, IProductWithRelations } from "@/types/product";

function buildQueryString(query: Partial<AdminProductQuery>) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const adminProductService = {
  list: (query: Partial<AdminProductQuery> = {}) =>
    adminApi.get<IAdminProductListResult>(`/api/admin/products${buildQueryString(query)}`),
  getById: (id: string) => adminApi.get<IProductWithRelations>(`/api/admin/products/${id}`),
  create: (input: ProductInput) => adminApi.post<IProductWithRelations>("/api/admin/products", input),
  update: (id: string, input: UpdateProductInput) =>
    adminApi.put<IProductWithRelations>(`/api/admin/products/${id}`, input),
  remove: (id: string) => adminApi.delete<null>(`/api/admin/products/${id}`),

  addImage: (productId: string, input: ProductImageInput) =>
    adminApi.post<IProductImage>(`/api/admin/products/${productId}/images`, input),
  updateImage: (productId: string, imageId: string, input: UpdateProductImageInput) =>
    adminApi.put<IProductImage>(`/api/admin/products/${productId}/images/${imageId}`, input),
  removeImage: (productId: string, imageId: string) =>
    adminApi.delete<null>(`/api/admin/products/${productId}/images/${imageId}`),

  addVariant: (productId: string, input: ProductVariantInput) =>
    adminApi.post<IProductVariant>(`/api/admin/products/${productId}/variants`, input),
  updateVariant: (productId: string, variantId: string, input: UpdateProductVariantInput) =>
    adminApi.put<IProductVariant>(`/api/admin/products/${productId}/variants/${variantId}`, input),
  removeVariant: (productId: string, variantId: string) =>
    adminApi.delete<null>(`/api/admin/products/${productId}/variants/${variantId}`),

  /**
   * Duplicates a product end-to-end (base fields + images + variants) using
   * only the existing per-resource endpoints — there is no dedicated
   * "duplicate" API. The clone is created unpublished so it never
   * accidentally goes live before the admin reviews it.
   */
  async duplicate(id: string): Promise<{ success: boolean; message: string; newId?: string }> {
    const original = await adminProductService.getById(id);
    if (!original.success || !original.data) {
      return { success: false, message: original.message || "Product not found." };
    }

    const source = original.data;
    const suffix = Math.random().toString(36).slice(2, 7);

    const created = await adminProductService.create({
      categoryId: source.categoryId,
      subCategoryId: source.subCategoryId ?? undefined,
      brandId: source.brandId ?? undefined,
      name: `${source.name} (Copy)`,
      slug: `${source.slug}-copy-${suffix}`,
      shortDescription: source.shortDescription ?? undefined,
      description: source.description ?? undefined,
      sku: source.sku ? `${source.sku}-COPY-${suffix}`.toUpperCase() : undefined,
      price: source.price,
      salePrice: source.salePrice ?? undefined,
      stock: source.stock,
      weight: source.weight ?? undefined,
      dimensions: source.dimensions ?? undefined,
      thumbnail: source.thumbnail,
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: false,
      isTrending: false,
      isPublished: false,
      hasVariants: source.hasVariants,
      metaTitle: source.metaTitle ?? undefined,
      metaDescription: source.metaDescription ?? undefined,
    });

    if (!created.success || !created.data) {
      return { success: false, message: created.message || "Could not duplicate product." };
    }

    const newId = created.data.id;

    await Promise.all([
      ...source.images.map((image) =>
        adminProductService.addImage(newId, { imageUrl: image.imageUrl, displayOrder: image.displayOrder })
      ),
      ...source.variants.map((variant) =>
        adminProductService.addVariant(newId, {
          size: variant.size ?? undefined,
          color: variant.color ?? undefined,
          sku: variant.sku ? `${variant.sku}-COPY-${suffix}`.toUpperCase() : undefined,
          price: variant.price ?? undefined,
          salePrice: variant.salePrice ?? undefined,
          stock: variant.stock,
          image: variant.image ?? undefined,
          isDefault: variant.isDefault,
        })
      ),
    ]);

    return { success: true, message: "Product duplicated.", newId };
  },
};
