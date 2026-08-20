import "server-only";

import { siteConfig } from "@/constants/config";
import { renderButton, renderEmailLayout, TEXT_MUTED, TEXT_PRIMARY } from "@/lib/email/emailLayout";
import type { OrderForEmail } from "@/lib/email/types";
import type { OrderStatusValue } from "@/features/orders/validation/order.schema";

interface StatusEmailContent {
  subject: string;
  heading: string;
  message: string;
}

/**
 * Only the 5 customer-facing transitions this feature covers get an email —
 * PENDING/PACKED/OUT_FOR_DELIVERY/REFUNDED intentionally have no entry, so
 * `buildOrderStatusEmail` returns `null` for them and no email is sent.
 */
const STATUS_EMAIL_CONTENT: Partial<Record<OrderStatusValue, StatusEmailContent>> = {
  CONFIRMED: {
    subject: "Order Confirmed",
    heading: "Your order has been confirmed",
    message: "Great news — we've confirmed your order and it's being prepared for processing.",
  },
  PROCESSING: {
    subject: "Order Processing",
    heading: "Your order is being processed",
    message: "Your order is now being processed and will be packed for shipping soon.",
  },
  SHIPPED: {
    subject: "Order Shipped",
    heading: "Your order is on its way!",
    message: "Your order has shipped and is on its way to you.",
  },
  DELIVERED: {
    subject: "Order Delivered",
    heading: "Your order has been delivered",
    message: "Your order has been delivered. We hope you love it!",
  },
  CANCELLED: {
    subject: "Order Cancelled",
    heading: "Your order has been cancelled",
    message: "Your order has been cancelled. If you have any questions, please reach out to our support team.",
  },
};

/** Customer order-status-change email. Returns `null` for statuses this feature doesn't email for (see `STATUS_EMAIL_CONTENT`). */
export function buildOrderStatusEmail(
  order: OrderForEmail,
  status: OrderStatusValue
): { subject: string; html: string } | null {
  const content = STATUS_EMAIL_CONTENT[status];
  if (!content) return null;

  const bodyHtml = `
    <h1 style="margin:0 0 4px;font-size:20px;font-weight:700;color:${TEXT_PRIMARY};">${content.heading}</h1>
    <p style="margin:0 0 4px;font-size:14px;line-height:160%;color:${TEXT_MUTED};">
      Hi ${order.customerName}, ${content.message}
    </p>
    <p style="margin:16px 0 0;font-size:13px;color:${TEXT_MUTED};">
      Order Number: <span style="color:${TEXT_PRIMARY};font-weight:600;">${order.orderNumber}</span>
    </p>
    ${renderButton(status === "CANCELLED" ? "View Order Details" : "Track Your Order", `${siteConfig.url}/orders/${order.id}`)}
  `;

  return {
    subject: `${content.subject} — ${order.orderNumber} | MoonKart`,
    html: renderEmailLayout({ title: `${content.subject} — ${order.orderNumber}`, bodyHtml }),
  };
}
