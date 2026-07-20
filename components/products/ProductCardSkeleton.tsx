import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 overflow-hidden rounded-product-card bg-card p-0 shadow-sm">
      <Skeleton className="aspect-square w-full rounded-t-product-card rounded-b-none" />
      <div className="flex flex-col gap-1.5 px-4 pb-4">
        <Skeleton className="h-2.5 w-14" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-5 w-16" />
        <Skeleton className="mt-2 h-9 w-full" />
      </div>
    </div>
  );
}













