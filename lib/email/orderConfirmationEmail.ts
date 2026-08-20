import "server-only";

import { siteConfig } from "@/constants/config";
import {
  paymentStatusLabel,
  renderAddressBlock,
  renderItemsTable,
  renderTotalsTable,
  sectionHeading,
} from "@/lib/email/emailComponents";
import { renderButton, renderEmailLayout, TEXT_MUTED, TEXT_PRIMARY } from "@/lib/email/emailLayout";
import type { OrderForEmail } from "@/lib/email/types";
import { formatDate } from "@/utils/formatDate";

/** Customer-facing "your order is confirmed" email — sent once, right after an order is successfully created and paid for. */
export function buildOrderConfirmationEmail(order: OrderForEmail): { subject: string; html: string } {
  const bodyHtml = `
    <h1 style="margin:0 0 4px;font-size:20px;font-weight:700;color:${TEXT_PRIMARY};">Thank you for your order, ${order.customerName}!</h1>
    <p style="margin:0 0 20px;font-size:14px;line-height:160%;color:${TEXT_MUTED};">
      Your order has been placed successfully and is being processed. Here are your order details:
    </p>

    ${sectionHeading("Order Summary")}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:2px 0;font-size:13px;color:${TEXT_MUTED};">Order Number</td>
        <td style="padding:2px 0;font-size:13px;color:${TEXT_PRIMARY};text-align:right;font-weight:600;">${order.orderNumber}</td>
      </tr>
      <tr>
        <td style="padding:2px 0;font-size:13px;color:${TEXT_MUTED};">Order Date</td>
        <td style="padding:2px 0;font-size:13px;color:${TEXT_PRIMARY};text-align:right;">${formatDate(order.createdAt)}</td>
      </tr>
      <tr>
        <td style="padding:2px 0;font-size:13px;color:${TEXT_MUTED};">Payment Status</td>
        <td style="padding:2px 0;font-size:13px;color:${TEXT_PRIMARY};text-align:right;">${paymentStatusLabel(order.paymentStatus)}</td>
      </tr>
    </table>

    ${sectionHeading("Items")}
    ${renderItemsTable(order.items)}
    ${renderTotalsTable(order)}

    ${sectionHeading("Shipping Address")}
    ${renderAddressBlock(order)}

    ${renderButton("View Your Order", `${siteConfig.url}/orders/${order.id}`)}
  `;

  return {
    subject: `Order Confirmed — ${order.orderNumber} | MoonKart`,
    html: renderEmailLayout({ title: `Order Confirmed — ${order.orderNumber}`, bodyHtml }),
  };
}
