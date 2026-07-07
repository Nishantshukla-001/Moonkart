import { Container } from "@/components/layout/Container";
import { CategoryCardSkeleton } from "@/components/categories/CategoryCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <Container className="flex flex-col gap-8 py-10 sm:py-12">
      <Skeleton className="h-8 w-56" />
      <div className="grid grid-cols-2 gap-5 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <CategoryCardSkeleton key={index} />
        ))}
      </div>
    </Container>
  );
}
