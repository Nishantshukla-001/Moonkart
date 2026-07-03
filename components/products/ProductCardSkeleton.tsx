import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 overflow-hidden rounded-product-card bg-card p-0 shadow-sm">
      <Skeleton className="aspect-square w-full rounded-t-product-card rounded-b-none" />
      <div className="flex flex-col gap-2 px-4 pb-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-6 w-20" />
        <Skeleton className="mt-1 h-9 w-full" />
      </div>
    </div>
  );
}
