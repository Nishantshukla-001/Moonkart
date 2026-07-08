import { formatCurrency } from "@/utils/formatCurrency";
import type { IOrder } from "@/types/order";

export function OrderTotalsSummary({ order }: { order: Pick<IOrder, "subtotal" | "discount" | "shippingCharge" | "tax" | "totalAmount"> }) {
  return (
    <div className="flex flex-col gap-2 text-sm">
      <div className="flex items-center justify-between text-text-secondary">
        <span>Subtotal</span>
        <span className="font-medium text-text-primary">{formatCurrency(order.subtotal)}</span>
      </div>
      <div className="flex items-center justify-between text-text-secondary">
        <span>Delivery Charges</span>
        <span className="font-medium text-success">
          {order.shippingCharge === 0 ? "Free" : formatCurrency(order.shippingCharge)}
        </span>
      </div>
      <div className="flex items-center justify-between text-text-secondary">
        <span>Discount</span>
        <span className="font-medium text-text-primary">
          {order.discount === 0 ? "—" : `-${formatCurrency(order.discount)}`}
        </span>
      </div>
      <div className="flex items-center justify-between text-text-secondary">
        <span>Taxes</span>
        <span className="font-medium text-text-primary">{order.tax === 0 ? "Included" : formatCurrency(order.tax)}</span>
      </div>
      <div className="mt-2 flex items-center justify-between border-t border-divider pt-3 font-heading text-base font-semibold text-text-primary">
        <span>Grand Total</span>
        <span>{formatCurrency(order.totalAmount)}</span>
      </div>
    </div>
  );
}
