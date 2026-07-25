import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import Razorpay from "razorpay";

/**
 * Server-only Razorpay client. Which mode (Test/Live) this talks to is
 * determined entirely by which key pair is in RAZORPAY_KEY_ID/SECRET — this
 * project currently uses Test Mode keys only.
 */
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const RAZORPAY_CURRENCY = "INR";

interface CreateRazorpayOrderParams {
  /** Smallest currency unit (paise for INR) — never accept a rupee amount directly from the client. */
  amount: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

/** Creates a Razorpay Order. Must happen server-side so the amount can't be tampered with by the client before payment. */
export async function createRazorpayOrder({
  amount,
  currency = RAZORPAY_CURRENCY,
  receipt,
  notes,
}: CreateRazorpayOrderParams) {
  return razorpay.orders.create({ amount, currency, receipt, notes });
}

interface VerifyRazorpaySignatureParams {
  orderId: string;
  paymentId: string;
  signature: string;
}

/**
 * Verifies a Razorpay Checkout payment signature per Razorpay's documented
 * scheme: hmac_sha256(`${orderId}|${paymentId}`, key_secret) must equal the
 * signature returned to the client. This is the only trustworthy way to
 * confirm a payment succeeded — a client-side "success" callback alone can
 * be forged and must never be trusted on its own.
 */
export function verifyRazorpaySignature({ orderId, paymentId, signature }: VerifyRazorpaySignatureParams): boolean {
  const expectedSignature = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const expected = Buffer.from(expectedSignature);
  const actual = Buffer.from(signature);

  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}
