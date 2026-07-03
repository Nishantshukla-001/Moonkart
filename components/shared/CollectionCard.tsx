import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

interface CollectionCardProps {
  name: string;
  slug: string;
  image: string;
  description?: string;
  className?: string;
}

export function CollectionCard({ name, slug, image, description, className }: CollectionCardProps) {
  return (
    <Link
      href={`/products?collection=${slug}`}
      className={cn(
        "group relative block aspect-[4/5] overflow-hidden rounded-product-card shadow-soft transition-all duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 hover:shadow-soft-lg",
        className
      )}
    >
      <Image
        src={image}
        alt={name}
        fill
        className="object-cover transition-transform duration-[500ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.08]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-6">
        <h3 className="font-heading text-xl font-semibold text-white">{name}</h3>
        {description && <p className="text-sm leading-[150%] text-white/85">{description}</p>}
      </div>
    </Link>
  );
}
