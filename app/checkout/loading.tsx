import { Container } from "@/components/layout/Container";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <Container className="grid grid-cols-1 gap-8 py-10 sm:py-12 lg:grid-cols-3">
      <div className="flex flex-col gap-4 lg:col-span-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-28 w-full rounded-card" />
        <Skeleton className="h-28 w-full rounded-card" />
        <Skeleton className="h-40 w-full rounded-card" />
      </div>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-64 w-full rounded-card" />
      </div>
    </Container>
  );
}
