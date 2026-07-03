import Link from "next/link";

import { Card } from "@/components/ui/card";
import { AspectImage } from "@/components/shared/AspectImage";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  name: string;
  slug: string;
  image: string;
  productCount?: number;
  className?: string;
}

const pastelTints = ["bg-blush/25", "bg-blush/15", "bg-bg-section", "bg-warm-yellow/25"] as const;

function pastelTintFor(slug: string) {
  const sum = [...slug].reduce((total, char) => total + char.charCodeAt(0), 0);
  return pastelTints[sum % pastelTints.length];
}

export function CategoryCard({ name, slug, image, productCount, className }: CategoryCardProps) {
  return (
    <Link href={`/categories/${slug}`}>
      <Card
        className={cn(
          "group gap-0 rounded-product-card p-0 ring-1 ring-transparent transition-all duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 hover:shadow-soft-lg hover:ring-blush/40",
          className
        )}
      >
        <AspectImage
          src={image}
          alt={name}
          ratio="landscape"
          rounded="rounded-t-product-card"
          imageClassName="transition-transform duration-[500ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.08]"
        />
        <div
          className={cn(
            "flex flex-col gap-1 px-4 py-5 text-center transition-colors duration-[250ms]",
            pastelTintFor(slug)
          )}
        >
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
