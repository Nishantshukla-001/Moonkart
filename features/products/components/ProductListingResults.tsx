import { Container } from "@/components/layout/Container";
import { getCategories } from "@/features/categories/services/category.service";
import { getBrands } from "@/features/categories/services/brand.service";
import { getProducts } from "@/features/products/services/product.service";
import { ProductFiltersPanel } from "@/features/products/components/ProductFiltersPanel";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { ProductSort } from "@/features/products/components/ProductSort";
import { ProductsPagination } from "@/features/products/components/ProductsPagination";
import type { ProductQuery } from "@/features/products/validation/productQuery.schema";

interface ProductListingResultsProps {
  query: ProductQuery;
  basePath: string;
  hideCategoryFilter?: boolean;
  hideBrandFilter?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

export async function ProductListingResults({
  query,
  basePath,
  hideCategoryFilter,
  hideBrandFilter,
  emptyTitle,
  emptyDescription,
}: ProductListingResultsProps) {
  const [result, categories, brands] = await Promise.all([
    getProducts(query),
    getCategories(),
    getBrands(),
  ]);

  return (
    <Container className="flex flex-col gap-6 py-10 sm:py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ProductFiltersPanel
            categories={categories}
            brands={brands}
            basePath={basePath}
            hideCategoryFilter={hideCategoryFilter}
            hideBrandFilter={hideBrandFilter}
          />
          <p className="text-sm text-text-secondary">
            {result.total} product{result.total === 1 ? "" : "s"}
          </p>
        </div>
        <ProductSort basePath={basePath} />
      </div>

      <ProductGrid
        products={result.items}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
      />

      <ProductsPagination
        basePath={basePath}
        currentPage={result.page}
        totalPages={result.totalPages}
      />
    </Container>
  );
}
