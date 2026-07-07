import { PackageSearch } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { ProductCardConnected } from "@/features/products/components/ProductCardConnected";
import type { IProductWithRelations } from "@/types/product";

interface ProductGridProps {
  products: IProductWithRelations[];
  emptyTitle?: string;
  emptyDescription?: string;
}

export function ProductGrid({
  products,
  emptyTitle = "No products found",
  emptyDescription = "Try adjusting your filters or search terms.",
}: ProductGridProps) {
  if (products.length === 0) {
    return <EmptyState icon={PackageSearch} title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="grid grid-cols-2 gap-5 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCardConnected key={product.id} product={product} />
      ))}
    </div>
  );
}
