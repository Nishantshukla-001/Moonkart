import type { NextRequest } from "next/server";

import { emailSchema } from "@/lib/validations";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { createClient } from "@/lib/supabase/server";

/** Resends the signup confirmation email. */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsedEmail = emailSchema.safeParse(body?.email);

  if (!parsedEmail.success) {
    return apiError("Enter a valid email address.", [], 422);
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  await supabase.auth.resend({
    type: "signup",
    email: parsedEmail.data,
    options: { emailRedirectTo: `${siteUrl}/auth/confirm?next=/auth/verify-email` },
  });

  return apiSuccess(null, "Verification email sent. Please check your inbox.");
}
