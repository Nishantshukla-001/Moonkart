import type { Metadata } from "next";

import { ProductsClient } from "@/features/admin/components/ProductsClient";
import { adminProductQuerySchema } from "@/features/admin/validation/adminProductQuery.schema";
import { getBrands } from "@/features/categories/services/brand.service";
import { getCategories } from "@/features/categories/services/category.service";
import { getProductsAdmin } from "@/features/products/services/product.service";

export const metadata: Metadata = { title: "Products" };

interface AdminProductsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const rawParams = await searchParams;
  const query = adminProductQuerySchema.parse(rawParams);

  const [result, categories, brands] = await Promise.all([
    getProductsAdmin(query),
    getCategories({ includeInactive: true }),
    getBrands({ includeInactive: true }),
  ]);

  return <ProductsClient result={result} categories={categories} brands={brands} query={query} />;
}
