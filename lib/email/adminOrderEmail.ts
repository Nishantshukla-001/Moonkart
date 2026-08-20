import "server-only";

import { siteConfig } from "@/constants/config";
import {
  paymentMethodLabel,
  paymentStatusLabel,
  renderAddressBlock,
  renderItemsTable,
  sectionHeading,
} from "@/lib/email/emailComponents";
import { renderButton, renderEmailLayout, TEXT_MUTED, TEXT_PRIMARY } from "@/lib/email/emailLayout";
import type { OrderForEmail } from "@/lib/email/types";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";

/** Internal "a new order came in" notification — sent to the MoonKart admin/owner inbox, not the customer. */
export function buildAdminOrderEmail(order: OrderForEmail): { subject: string; html: string } {
  const bodyHtml = `
    <h1 style="margin:0 0 4px;font-size:20px;font-weight:700;color:${TEXT_PRIMARY};">New Order Received</h1>
    <p style="margin:0 0 20px;font-size:14px;line-height:160%;color:${TEXT_MUTED};">
      Order ${order.orderNumber} was placed on ${formatDate(order.createdAt, { hour: "numeric", minute: "2-digit" })}.
    </p>

    ${sectionHeading("Customer")}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:2px 0;font-size:13px;color:${TEXT_MUTED};">Name</td>
        <td style="padding:2px 0;font-size:13px;color:${TEXT_PRIMARY};text-align:right;font-weight:600;">${order.customerName}</td>
      </tr>
      <tr>
        <td style="padding:2px 0;font-size:13px;color:${TEXT_MUTED};">Email</td>
        <td style="padding:2px 0;font-size:13px;color:${TEXT_PRIMARY};text-align:right;">${order.customerEmail}</td>
      </tr>
      <tr>
        <td style="padding:2px 0;font-size:13px;color:${TEXT_MUTED};">Phone</td>
        <td style="padding:2px 0;font-size:13px;color:${TEXT_PRIMARY};text-align:right;">${order.customerPhone}</td>
      </tr>
    </table>

    ${sectionHeading("Items")}
    ${renderItemsTable(order.items)}

    ${sectionHeading("Payment")}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:2px 0;font-size:13px;color:${TEXT_MUTED};">Total Amount</td>
        <td style="padding:2px 0;font-size:15px;color:${TEXT_PRIMARY};text-align:right;font-weight:700;">${formatCurrency(order.totalAmount)}</td>
      </tr>
      <tr>
        <td style="padding:2px 0;font-size:13px;color:${TEXT_MUTED};">Payment Method</td>
        <td style="padding:2px 0;font-size:13px;color:${TEXT_PRIMARY};text-align:right;">${paymentMethodLabel(order.paymentMethod)}</td>
      </tr>
      <tr>
        <td style="padding:2px 0;font-size:13px;color:${TEXT_MUTED};">Payment Status</td>
        <td style="padding:2px 0;font-size:13px;color:${TEXT_PRIMARY};text-align:right;">${paymentStatusLabel(order.paymentStatus)}</td>
      </tr>
    </table>

    ${sectionHeading("Shipping Address")}
    ${renderAddressBlock(order)}

    ${renderButton("View in Admin Panel", `${siteConfig.url}/admin/orders/${order.id}`)}
  `;

  return {
    subject: `New Order Received — ${order.orderNumber}`,
    html: renderEmailLayout({ title: `New Order — ${order.orderNumber}`, bodyHtml }),
  };
}
