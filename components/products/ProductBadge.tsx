import { cn } from "@/lib/utils";

export type ProductBadgeType = "new" | "sale" | "trending" | "exclusive" | "limited";

const badgeConfig: Record<ProductBadgeType, { label: string; className: string }> = {
  new: { label: "New Arrival", className: "bg-badge-new/90 text-text-primary" },
  sale: { label: "Sale", className: "bg-badge-sale/90 text-text-primary" },
  trending: { label: "Trending", className: "bg-badge-trending/90 text-text-primary" },
  exclusive: { label: "Exclusive", className: "bg-badge-exclusive/90 text-text-primary" },
  limited: { label: "Limited Edition", className: "bg-badge-limited/90 text-white" },
};

interface ProductBadgeProps {
  type: ProductBadgeType;
  className?: string;
}

export function ProductBadge({ type, className }: ProductBadgeProps) {
  const config = badgeConfig[type];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 font-heading text-[11px] font-semibold tracking-[0.4px] uppercase shadow-soft backdrop-blur-sm",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
