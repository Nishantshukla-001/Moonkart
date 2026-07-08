import Link from "next/link";

import { AspectImage } from "@/components/shared/AspectImage";
import { formatCurrency } from "@/utils/formatCurrency";
import type { IOrderItem } from "@/types/order";

export function OrderItemsList({ items, linkToProducts = true }: { items: IOrderItem[]; linkToProducts?: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => {
        const image = (
          <div className="size-16 shrink-0">
            <AspectImage src={item.productImage} alt={item.productName} ratio="square" rounded="rounded-lg" />
          </div>
        );

        return (
          <div key={item.id} className="flex items-center gap-3">
            {linkToProducts ? (
              <Link href={`/products/${item.productSlug}`} className="shrink-0">
                {image}
              </Link>
            ) : (
              image
            )}
            <div className="min-w-0 flex-1">
              {linkToProducts ? (
                <Link
                  href={`/products/${item.productSlug}`}
                  className="line-clamp-1 text-sm font-medium text-text-primary hover:text-blush-hover"
                >
                  {item.productName}
                </Link>
              ) : (
                <p className="line-clamp-1 text-sm font-medium text-text-primary">{item.productName}</p>
              )}
              {item.variantLabel && <p className="text-xs text-text-muted">{item.variantLabel}</p>}
              <p className="text-xs text-text-muted">
                Qty {item.quantity} × {formatCurrency(item.unitPrice)}
              </p>
            </div>
            <p className="shrink-0 text-sm font-semibold text-text-primary">{formatCurrency(item.lineTotal)}</p>
          </div>
        );
      })}
    </div>
  );
}
