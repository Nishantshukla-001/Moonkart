import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OrderStatusValue } from "@/features/orders/validation/order.schema";

const statusStyles: Record<OrderStatusValue, string> = {
  PENDING: "bg-warning/20 text-warning",
  CONFIRMED: "bg-blush-light text-blush-hover",
  PROCESSING: "bg-blush-light text-blush-hover",
  PACKED: "bg-sage-light text-sage-hover",
  SHIPPED: "bg-sage-light text-sage-hover",
  DELIVERED: "bg-success/15 text-success",
  CANCELLED: "bg-danger/15 text-danger",
};

const statusLabels: Record<OrderStatusValue, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export function OrderStatusBadge({ status }: { status: OrderStatusValue }) {
  return (
    <Badge variant="outline" className={cn("border-transparent", statusStyles[status])}>
      {statusLabels[status]}
    </Badge>
  );
}
