import "server-only";

import { formatCurrency } from "@/utils/formatCurrency";
import { BORDER, TEXT_MUTED, TEXT_PRIMARY } from "@/lib/email/emailLayout";
import type { OrderForEmail } from "@/lib/email/types";

const PAYMENT_METHOD_LABELS: Record<OrderForEmail["paymentMethod"], string> = {
  COD: "Cash on Delivery",
  RAZORPAY: "Razorpay (Online Payment)",
};

const PAYMENT_STATUS_LABELS: Record<OrderForEmail["paymentStatus"], string> = {
  PENDING: "Pending",
  PAID: "Paid",
};

export function paymentMethodLabel(method: OrderForEmail["paymentMethod"]): string {
  return PAYMENT_METHOD_LABELS[method] ?? method;
}

export function paymentStatusLabel(status: OrderForEmail["paymentStatus"]): string {
  return PAYMENT_STATUS_LABELS[status] ?? status;
}

/** Shared line-items table — used by both the customer confirmation and admin new-order emails so the two stay visually consistent. */
export function renderItemsTable(items: OrderForEmail["items"]): string {
  const rows = items
    .map(
      (item) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid ${BORDER};font-size:13px;color:${TEXT_PRIMARY};">
          ${item.productName}${item.variantLabel ? `<br /><span style="font-size:12px;color:${TEXT_MUTED};">${item.variantLabel}</span>` : ""}
        </td>
        <td style="padding:10px 0;border-bottom:1px solid ${BORDER};font-size:13px;color:${TEXT_MUTED};text-align:center;">${item.quantity}</td>
        <td style="padding:10px 0;border-bottom:1px solid ${BORDER};font-size:13px;color:${TEXT_MUTED};text-align:right;">${formatCurrency(item.unitPrice)}</td>
        <td style="padding:10px 0;border-bottom:1px solid ${BORDER};font-size:13px;color:${TEXT_PRIMARY};text-align:right;font-weight:600;">${formatCurrency(item.lineTotal)}</td>
      </tr>`
    )
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
    <tr>
      <td style="padding:0 0 8px;border-bottom:2px solid ${BORDER};font-size:11px;font-weight:700;letter-spacing:0.4px;color:${TEXT_MUTED};text-transform:uppercase;">Product</td>
      <td style="padding:0 0 8px;border-bottom:2px solid ${BORDER};font-size:11px;font-weight:700;letter-spacing:0.4px;color:${TEXT_MUTED};text-transform:uppercase;text-align:center;">Qty</td>
      <td style="padding:0 0 8px;border-bottom:2px solid ${BORDER};font-size:11px;font-weight:700;letter-spacing:0.4px;color:${TEXT_MUTED};text-transform:uppercase;text-align:right;">Price</td>
      <td style="padding:0 0 8px;border-bottom:2px solid ${BORDER};font-size:11px;font-weight:700;letter-spacing:0.4px;color:${TEXT_MUTED};text-transform:uppercase;text-align:right;">Total</td>
    </tr>
    ${rows}
  </table>`;
}

/** Shared order-totals breakdown — subtotal always shown; shipping/tax only shown when non-zero, so the visible rows always sum to the total. */
export function renderTotalsTable(order: OrderForEmail): string {
  const rows = [`<tr><td style="padding:4px 0;font-size:13px;color:${TEXT_MUTED};">Subtotal</td><td style="padding:4px 0;font-size:13px;color:${TEXT_PRIMARY};text-align:right;">${formatCurrency(order.subtotal)}</td></tr>`];

  if (order.discount > 0) {
    rows.push(
      `<tr><td style="padding:4px 0;font-size:13px;color:${TEXT_MUTED};">Discount</td><td style="padding:4px 0;font-size:13px;color:${TEXT_PRIMARY};text-align:right;">-${formatCurrency(order.discount)}</td></tr>`
    );
  }
  if (order.shippingCharge > 0) {
    rows.push(
      `<tr><td style="padding:4px 0;font-size:13px;color:${TEXT_MUTED};">Shipping</td><td style="padding:4px 0;font-size:13px;color:${TEXT_PRIMARY};text-align:right;">${formatCurrency(order.shippingCharge)}</td></tr>`
    );
  }
  if (order.tax > 0) {
    rows.push(
      `<tr><td style="padding:4px 0;font-size:13px;color:${TEXT_MUTED};">Tax</td><td style="padding:4px 0;font-size:13px;color:${TEXT_PRIMARY};text-align:right;">${formatCurrency(order.tax)}</td></tr>`
    );
  }

  rows.push(
    `<tr><td style="padding:10px 0 0;border-top:2px solid ${BORDER};font-size:15px;font-weight:700;color:${TEXT_PRIMARY};">Total</td><td style="padding:10px 0 0;border-top:2px solid ${BORDER};font-size:15px;font-weight:700;color:${TEXT_PRIMARY};text-align:right;">${formatCurrency(order.totalAmount)}</td></tr>`
  );

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">${rows.join("")}</table>`;
}

export function renderAddressBlock(order: OrderForEmail): string {
  return `<p style="margin:0;font-size:13px;line-height:170%;color:${TEXT_PRIMARY};">
    ${order.shippingFullName}<br />
    ${order.shippingAddressLine1}${order.shippingAddressLine2 ? `, ${order.shippingAddressLine2}` : ""}<br />
    ${order.shippingCity}, ${order.shippingState} ${order.shippingPostalCode}<br />
    ${order.shippingCountry}<br />
    Phone: ${order.shippingPhone}
  </p>`;
}

export function sectionHeading(label: string): string {
  return `<h2 style="margin:24px 0 8px;font-size:13px;font-weight:700;letter-spacing:0.4px;color:${TEXT_MUTED};text-transform:uppercase;">${label}</h2>`;
}
