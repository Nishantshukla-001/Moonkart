import { Container } from "@/components/layout/Container";
import { ProductCardSkeleton } from "@/components/products/ProductCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductListingSkeleton() {
  return (
    <Container className="flex flex-col gap-8 py-10 sm:py-12 lg:flex-row lg:items-start lg:gap-10">
      <div className="hidden w-64 shrink-0 flex-col gap-4 lg:flex">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="grid flex-1 grid-cols-2 gap-5 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </Container>
  );
}
