import type { NextRequest } from "next/server";
import { z } from "zod";

import { apiError, apiSuccess } from "@/lib/apiResponse";
import { getCurrentUser } from "@/lib/auth";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().trim().min(1, "razorpay_order_id is required."),
  razorpay_payment_id: z.string().trim().min(1, "razorpay_payment_id is required."),
  razorpay_signature: z.string().trim().min(1, "razorpay_signature is required."),
});

/** Verifies a Razorpay Checkout payment signature for the authenticated user. Does not touch our own Order records — that wiring happens once checkout is integrated. */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return apiError("Not authenticated.", [], 401);
  if (!user.isActive) return apiError("This account is deactivated.", [], 403);

  const { allowed, retryAfterSeconds } = rateLimit(`razorpay:verify:${user.id}:${getClientIp(request)}`, 10, 60_000);
  if (!allowed) {
    return apiError(`Too many requests. Try again in ${retryAfterSeconds}s.`, [], 429);
  }

  const body = await request.json().catch(() => null);
  if (!body) return apiError("Invalid request body.", [], 400);

  const parsed = verifyPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "Validation failed.",
      parsed.error.issues.map((issue) => issue.message),
      422
    );
  }

  const isValid = verifyRazorpaySignature({
    orderId: parsed.data.razorpay_order_id,
    paymentId: parsed.data.razorpay_payment_id,
    signature: parsed.data.razorpay_signature,
  });

  if (!isValid) {
    return apiError("Payment signature verification failed.", [], 400);
  }

  return apiSuccess({ verified: true }, "Payment verified.");
}
