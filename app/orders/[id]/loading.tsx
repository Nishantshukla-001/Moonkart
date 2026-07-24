import { Container } from "@/components/layout/Container";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <Container className="flex flex-col gap-8 py-10 sm:py-12">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-8 w-56" />
      </div>
      <Skeleton className="h-16 w-full rounded-card" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Skeleton className="h-64 w-full rounded-card lg:col-span-2" />
        <Skeleton className="h-48 w-full rounded-card" />
      </div>
    </Container>
  );
}
