import "server-only";

import { contactInfo } from "@/constants/config";
import resend from "@/lib/resend";
import { buildAdminOrderEmail } from "@/lib/email/adminOrderEmail";
import { buildOrderConfirmationEmail } from "@/lib/email/orderConfirmationEmail";
import { buildOrderStatusEmail } from "@/lib/email/orderStatusEmail";
import type { OrderForEmail } from "@/lib/email/types";
import type { OrderStatusValue } from "@/features/orders/validation/order.schema";

// Same verified-domain sender already used (and tested) by app/api/test-email/route.ts.
const EMAIL_FROM = "MoonKart <noreply@themoonkart.com>";

/**
 * Every function here is meant to be called from inside `after()` at the
 * call site (see order.service.ts) — never awaited on the critical
 * checkout/order-update path. Each one throws on failure rather than
 * swallowing the error itself, so the caller's own `.catch()` is the single
 * place a Resend failure gets logged, without ever affecting the
 * already-successful order.
 */

async function send(to: string, subject: string, html: string) {
  const { error } = await resend.emails.send({ from: EMAIL_FROM, to: [to], subject, html });
  if (error) throw new Error(`Resend error: ${JSON.stringify(error)}`);
}

/** Customer order-confirmation email — call once, right after an order is successfully created. */
export async function sendOrderConfirmationEmail(order: OrderForEmail) {
  const { subject, html } = buildOrderConfirmationEmail(order);
  await send(order.customerEmail, subject, html);
}

/**
 * Admin "new order" notification. Recipient is `contactInfo.email` from
 * constants/config.ts — the same business email address the already-tested
 * `/api/test-email` route sends to, and the single existing source of truth
 * this project already uses for "the MoonKart business inbox" everywhere
 * else (footer, contact page, SEO schema).
 */
export async function sendAdminNewOrderEmail(order: OrderForEmail) {
  const { subject, html } = buildAdminOrderEmail(order);
  await send(contactInfo.email, subject, html);
}

/** Customer order-status-change email. No-ops (sends nothing) for statuses this feature doesn't cover — see orderStatusEmail.ts. */
export async function sendOrderStatusEmail(order: OrderForEmail, status: OrderStatusValue) {
  const built = buildOrderStatusEmail(order, status);
  if (!built) return;
  await send(order.customerEmail, built.subject, built.html);
}
