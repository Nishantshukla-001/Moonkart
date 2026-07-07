import { Badge } from "@/components/ui/badge";
import { LOW_STOCK_THRESHOLD } from "@/features/admin/validation/adminProductQuery.schema";
import { cn } from "@/lib/utils";

export function PublishedBadge({ isPublished }: { isPublished: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-transparent",
        isPublished ? "bg-success/15 text-success" : "bg-muted text-text-muted"
      )}
    >
      {isPublished ? "Published" : "Draft"}
    </Badge>
  );
}

export function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) {
    return (
      <Badge variant="outline" className="border-transparent bg-danger/15 text-danger">
        Out of Stock
      </Badge>
    );
  }

  if (stock <= LOW_STOCK_THRESHOLD) {
    return (
      <Badge variant="outline" className="border-transparent bg-warning/20 text-warning">
        Low Stock · {stock}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="border-transparent bg-sage-light text-sage-hover">
      In Stock · {stock}
    </Badge>
  );
}
