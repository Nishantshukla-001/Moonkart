import { SearchX } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { EmptyState } from "@/components/shared/EmptyState";
import { ROUTES } from "@/constants/routes";

export default function NotFound() {
  return (
    <Container className="py-24">
      <EmptyState
        icon={SearchX}
        title="Page not found"
        description="The page you're looking for doesn't exist or may have been moved."
      />
      <div className="mt-6 flex justify-center">
        <Button render={<Link href={ROUTES.home} />}>Return Home</Button>
      </div>
    </Container>
  );
}
