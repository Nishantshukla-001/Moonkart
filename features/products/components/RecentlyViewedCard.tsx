import Link from "next/link";

import { AspectImage } from "@/components/shared/AspectImage";
import { formatCurrency } from "@/utils/formatCurrency";
import type { RecentlyViewedItem } from "@/lib/recentlyViewedStorage";

/** Lightweight, read-only card for the denormalized (localStorage) recently-viewed list — no live stock/variant data, so it links through to the PDP rather than offering Add to Cart directly. */
export function RecentlyViewedCard({ item }: { item: RecentlyViewedItem }) {
  return (
    <Link href={`/products/${item.slug}`} className="group flex h-full w-full flex-col gap-2.5">
      <AspectImage
        src={item.image}
        alt={item.name}
        ratio="square"
        rounded="rounded-product-card"
        className="shadow-soft"
        imageClassName="transition-transform duration-[500ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.08]"
      />
      <div>
        <h3 className="line-clamp-2 text-sm font-medium text-text-primary group-hover:text-blush-hover">
          {item.name}
        </h3>
        <p className="mt-0.5 text-sm font-semibold text-text-primary">{formatCurrency(item.price)}</p>
      </div>
    </Link>
  );
}
