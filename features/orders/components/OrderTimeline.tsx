import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { OrderStatusValue } from "@/features/orders/validation/order.schema";

const STEPS: { status: OrderStatusValue; label: string }[] = [
  { status: "PENDING", label: "Pending" },
  { status: "CONFIRMED", label: "Confirmed" },
  { status: "PROCESSING", label: "Processing" },
  { status: "PACKED", label: "Packed" },
  { status: "SHIPPED", label: "Shipped" },
  { status: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { status: "DELIVERED", label: "Delivered" },
];

export function OrderTimeline({ status }: { status: OrderStatusValue }) {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-3 rounded-lg bg-danger/10 px-4 py-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-danger/20">
          <X className="size-4 text-danger" aria-hidden="true" />
        </div>
        <p className="text-sm font-medium text-danger">This order was cancelled.</p>
      </div>
    );
  }

  if (status === "REFUNDED") {
    return (
      <div className="flex items-center gap-3 rounded-lg bg-text-muted/10 px-4 py-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-text-muted/20">
          <Check className="size-4 text-text-secondary" aria-hidden="true" />
        </div>
        <p className="text-sm font-medium text-text-secondary">This order was refunded.</p>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((step) => step.status === status);

  return (
    <ol className="flex flex-col gap-0 sm:flex-row sm:items-start" aria-label="Order progress">
      {STEPS.map((step, index) => {
        const isComplete = index <= currentIndex;
        const isLast = index === STEPS.length - 1;

        return (
          <li key={step.status} className="flex flex-1 items-start gap-2 sm:flex-col sm:items-center sm:gap-2">
            <div className="flex items-center gap-2 sm:flex-col">
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  isComplete ? "bg-blush text-text-primary" : "bg-bg-section text-text-muted"
                )}
                aria-current={index === currentIndex ? "step" : undefined}
              >
                {isComplete ? <Check className="size-4" aria-hidden="true" /> : index + 1}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "h-8 w-0.5 sm:h-0.5 sm:w-full sm:flex-1",
                    index < currentIndex ? "bg-blush" : "bg-bg-section"
                  )}
                  aria-hidden="true"
                />
              )}
            </div>
            <span
              className={cn(
                "pt-1.5 text-xs font-medium sm:text-center",
                isComplete ? "text-text-primary" : "text-text-muted"
              )}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
