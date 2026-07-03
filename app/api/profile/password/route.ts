import type { NextRequest } from "next/server";

import { changePasswordSchema } from "@/features/auth/validation/auth.schema";
import { getCurrentUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { mapSupabaseAuthError } from "@/lib/authErrors";
import { createClient } from "@/lib/supabase/server";

export async function PUT(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return apiError("Not authenticated.", [], 401);
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return apiError("Invalid request body.", [], 400);
  }

  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "Validation failed.",
      parsed.error.issues.map((issue) => issue.message),
      422
    );
  }

  const supabase = await createClient();

  // Supabase has no standalone "verify current password" call — confirm
  // identity by re-authenticating with it before allowing the change.
  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.currentPassword,
  });

  if (reauthError) {
    return apiError("Current password is incorrect.", [], 401);
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.newPassword });

  if (error) {
    return apiError(mapSupabaseAuthError(error.message), [], 400);
  }

  return apiSuccess(null, "Password changed successfully.");
}
