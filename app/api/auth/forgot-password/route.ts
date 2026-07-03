import type { NextRequest } from "next/server";

import { forgotPasswordSchema } from "@/features/auth/validation/auth.schema";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return apiError("Invalid request body.", [], 400);
  }

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "Validation failed.",
      parsed.error.issues.map((issue) => issue.message),
      422
    );
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/auth/confirm?next=/auth/reset-password`,
  });

  // Always a generic success — never reveal whether an account exists.
  return apiSuccess(null, "If an account exists for this email, a reset link has been sent.");
}
