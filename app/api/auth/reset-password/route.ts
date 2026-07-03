import type { NextRequest } from "next/server";

import { resetPasswordSchema } from "@/features/auth/validation/auth.schema";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { mapSupabaseAuthError } from "@/lib/authErrors";
import { createClient } from "@/lib/supabase/server";

/**
 * Sets a new password for the user currently holding a Supabase "recovery"
 * session — established by visiting the link from the forgot-password
 * email, which is exchanged for a session in app/auth/confirm/route.ts.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return apiError("Invalid request body.", [], 400);
  }

  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "Validation failed.",
      parsed.error.issues.map((issue) => issue.message),
      422
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("Your reset link has expired. Please request a new one.", [], 401);
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return apiError(mapSupabaseAuthError(error.message), [], 400);
  }

  return apiSuccess(null, "Password updated successfully. You can now log in.");
}
