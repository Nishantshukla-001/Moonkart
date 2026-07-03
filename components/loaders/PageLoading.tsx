import { Spinner } from "@/components/loaders/Spinner";

export function PageLoading() {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
