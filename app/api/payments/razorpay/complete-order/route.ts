import type { NextRequest } from "next/server";

import { placeOrderFromRazorpayPayment } from "@/features/orders/services/order.service";
import { placeOrderFromRazorpaySchema } from "@/features/orders/validation/order.schema";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { getCurrentUser } from "@/lib/auth";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

/**
 * Creates the store Order once a Razorpay payment has succeeded. This is the
 * step that actually decrements stock and writes a database record, so it
 * independently re-verifies the payment signature here rather than trusting
 * that `/api/payments/razorpay/verify` was already called for this request —
 * a client claim of "payment succeeded" is never enough on its own.
 */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return apiError("Not authenticated.", [], 401);
  if (!user.isActive) return apiError("This account is deactivated.", [], 403);

  const { allowed, retryAfterSeconds } = rateLimit(
    `razorpay:complete-order:${user.id}:${getClientIp(request)}`,
    10,
    60_000
  );
  if (!allowed) {
    return apiError(`Too many requests. Try again in ${retryAfterSeconds}s.`, [], 429);
  }

  const body = await request.json().catch(() => null);
  if (!body) return apiError("Invalid request body.", [], 400);

  const parsed = placeOrderFromRazorpaySchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "Validation failed.",
      parsed.error.issues.map((issue) => issue.message),
      422
    );
  }

  const isValidSignature = verifyRazorpaySignature({
    orderId: parsed.data.razorpay_order_id,
    paymentId: parsed.data.razorpay_payment_id,
    signature: parsed.data.razorpay_signature,
  });
  if (!isValidSignature) {
    return apiError("Payment signature verification failed.", [], 400);
  }

  const result = await placeOrderFromRazorpayPayment({
    userId: user.id,
    addressId: parsed.data.addressId,
    razorpayOrderId: parsed.data.razorpay_order_id,
    razorpayPaymentId: parsed.data.razorpay_payment_id,
  });

  if (!result.success) {
    console.error("Could not finalize order after successful Razorpay payment:", {
      userId: user.id,
      razorpayOrderId: parsed.data.razorpay_order_id,
      razorpayPaymentId: parsed.data.razorpay_payment_id,
      error: result.error,
    });
    return apiError(result.error, [], 409);
  }

  return apiSuccess(result.order, "Order placed.", result.alreadyExisted ? 200 : 201);
}
