import Link from "next/link";

import { Card } from "@/components/ui/card";
import { AspectImage } from "@/components/shared/AspectImage";
import { cn } from "@/lib/utils";

interface BrandCardProps {
  name: string;
  slug: string;
  logo: string;
  productCount?: number;
  className?: string;
}

export function BrandCard({ name, slug, logo, productCount, className }: BrandCardProps) {
  return (
    <Link href={`/brands/${slug}`}>
      <Card
        className={cn(
          "group gap-0 rounded-product-card p-0 ring-1 ring-transparent transition-all duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 hover:shadow-soft-lg hover:ring-blush/25",
          className
        )}
      >
        <AspectImage
          src={logo}
          alt={name}
          ratio="landscape"
          rounded="rounded-t-product-card"
          imageClassName="object-contain p-8 transition-transform duration-[500ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
        />
        <div className="flex flex-col gap-1 px-4 py-5 text-center">
          <span className="font-heading text-base font-semibold text-text-primary transition-colors duration-[250ms] group-hover:text-blush-hover">
            {name}
          </span>
          {productCount !== undefined && (
            <span className="text-xs text-text-muted">{productCount} products</span>
          )}
        </div>
      </Card>
    </Link>
  );
}
