import type { NextRequest } from "next/server";
import { z } from "zod";

import { calculateCartSubtotal } from "@/features/orders/services/order.service";
import { calculateShippingCharge } from "@/features/orders/utils";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createRazorpayOrder, RAZORPAY_CURRENCY } from "@/lib/razorpay";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

const createOrderSchema = z.object({
  addressId: z.uuid("Select a shipping address."),
  receipt: z.string().trim().min(1, "Receipt is required.").max(100, "Receipt must be 100 characters or fewer."),
});

/**
 * Creates a Razorpay Order (Test Mode) for the authenticated user.
 *
 * The amount is computed entirely server-side from the user's live cart and
 * selected address — never accepted from the client — so the browser can
 * never under-report the subtotal or strip out the shipping charge before
 * payment. (discount/tax remain 0 — out of scope, same as order placement.)
 */
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

  const address = await prisma.address.findFirst({
    where: { id: parsed.data.addressId, userId: user.id },
  });
  if (!address) return apiError("Selected address not found.", [], 404);

  const subtotalResult = await calculateCartSubtotal(user.id);
  if (!subtotalResult.success) return apiError(subtotalResult.error, [], 409);

  const discount = 0;
  const shippingCharge = calculateShippingCharge(address.city, address.state);
  const tax = 0;
  const totalAmount = subtotalResult.subtotal - discount + shippingCharge + tax;
  const amountInPaise = Math.round(totalAmount * 100);

  if (amountInPaise <= 0) {
    return apiError("Order amount must be greater than zero.", [], 422);
  }

  try {
    const order = await createRazorpayOrder({
      amount: amountInPaise,
      currency: RAZORPAY_CURRENCY,
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
