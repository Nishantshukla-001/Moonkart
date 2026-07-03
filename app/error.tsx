"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { EmptyState } from "@/components/shared/EmptyState";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Container className="py-24">
      <EmptyState
        icon={AlertTriangle}
        title="Something went wrong"
        description="An unexpected error occurred. Please try again."
      />
      <div className="mt-6 flex justify-center">
        <Button onClick={reset}>Try Again</Button>
      </div>
    </Container>
  );
}
