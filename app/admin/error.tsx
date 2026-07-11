"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="py-16">
      <EmptyState
        icon={AlertTriangle}
        title="Something went wrong"
        description="An unexpected error occurred loading this admin page. Please try again."
      />
      <div className="mt-6 flex justify-center">
        <Button onClick={reset}>Try Again</Button>
      </div>
    </div>
  );
}
