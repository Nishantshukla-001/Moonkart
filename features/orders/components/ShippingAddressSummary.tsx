import type { IOrder } from "@/types/order";

export function ShippingAddressSummary({ order }: { order: IOrder }) {
  return (
    <div className="flex flex-col gap-0.5 text-sm text-text-secondary">
      <p className="font-medium text-text-primary">{order.shippingFullName}</p>
      <p>
        {order.shippingAddressLine1}
        {order.shippingAddressLine2 ? `, ${order.shippingAddressLine2}` : ""}
      </p>
      <p>
        {order.shippingCity}, {order.shippingState} {order.shippingPostalCode}
      </p>
      <p>{order.shippingCountry}</p>
      <p className="mt-1 text-text-muted">{order.shippingPhone}</p>
    </div>
  );
}
