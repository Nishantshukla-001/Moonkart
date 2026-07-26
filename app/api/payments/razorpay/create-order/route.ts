import type { NextRequest } from "next/server";
import { z } from "zod";

import { apiError, apiSuccess } from "@/lib/apiResponse";
import { getCurrentUser } from "@/lib/auth";
import { createRazorpayOrder, RAZORPAY_CURRENCY } from "@/lib/razorpay";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

const createOrderSchema = z.object({
  amount: z
    .number("Amount is required.")
    .int("Amount must be an integer number of paise.")
    .positive("Amount must be greater than zero."),
  currency: z.literal(RAZORPAY_CURRENCY).default(RAZORPAY_CURRENCY),
  receipt: z.string().trim().min(1, "Receipt is required.").max(100, "Receipt must be 100 characters or fewer."),
});

/** Creates a Razorpay Order (Test Mode) for the authenticated user. Does not touch our own Order records — that wiring happens once checkout is integrated. */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return apiError("Not authenticated.", [], 401);
  if (!user.isActive) return apiError("This account is deactivated.", [], 403);

  const { allowed, retryAfterSeconds } = rateLimit(
    `razorpay:create-order:${user.id}:${getClientIp(request)}`,
    10,
    60_000
  );
  if (!allowed) {
    return apiError(`Too many requests. Try again in ${retryAfterSeconds}s.`, [], 429);
  }

  const body = await request.json().catch(() => null);
  if (!body) return apiError("Invalid request body.", [], 400);

  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "Validation failed.",
      parsed.error.issues.map((issue) => issue.message),
      422
    );
  }

  try {
    const order = await createRazorpayOrder({
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      receipt: parsed.data.receipt,
      notes: { userId: user.id },
    });

    // key_id is Razorpay's public identifier, not a secret — Checkout
    // requires it client-side to open the payment widget, so it's included
    // here rather than duplicating RAZORPAY_KEY_ID into a NEXT_PUBLIC_ var.
    return apiSuccess({ ...order, key: process.env.RAZORPAY_KEY_ID }, "Razorpay order created.", 201);
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    return apiError("Could not create payment order. Please try again.", [], 502);
  }
}
