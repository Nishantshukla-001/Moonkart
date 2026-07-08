import { PackageSearch } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Carousel, sectionBackgrounds } from "@/components/shared/Carousel";
import { EmptyState } from "@/components/shared/EmptyState";
import { ProductCardConnected } from "@/features/products/components/ProductCardConnected";
import { cn } from "@/lib/utils";
import type { IProductWithRelations } from "@/types/product";

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: IProductWithRelations[];
  viewAllHref: string;
  background?: "white" | "blush" | "cream";
}

export function ProductSection({
  title,
  subtitle,
  products,
  viewAllHref,
  background = "white",
}: ProductSectionProps) {
  if (products.length === 0) {
    return (
      <section className={cn("py-16 sm:py-20", sectionBackgrounds[background])}>
        <Container>
          <EmptyState icon={PackageSearch} title={`No ${title.toLowerCase()} yet`} description="Check back soon." />
        </Container>
      </section>
    );
  }

  return (
    <Carousel title={title} subtitle={subtitle} viewAllHref={viewAllHref} ariaLabel={title} background={background}>
      {products.map((product) => (
        <ProductCardConnected key={product.id} product={product} />
      ))}
    </Carousel>
  );
}
