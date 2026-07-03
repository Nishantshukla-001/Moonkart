import type { NextRequest } from "next/server";

import { loginSchema } from "@/features/auth/validation/auth.schema";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { mapSupabaseAuthError } from "@/lib/authErrors";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const REMEMBER_ME_MAX_AGE = 400 * 24 * 60 * 60; // library default (persistent)

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return apiError("Invalid request body.", [], 400);
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "Validation failed.",
      parsed.error.issues.map((issue) => issue.message),
      422
    );
  }

  const { email, password, rememberMe } = parsed.data;

  // When "Remember Me" is unchecked, write a session-only cookie (cleared
  // when the browser closes) instead of the library's persistent default.
  const supabase = await createClient({
    maxAge: rememberMe ? REMEMBER_ME_MAX_AGE : undefined,
  });

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return apiError(mapSupabaseAuthError(error?.message ?? ""), [], 401);
  }

  const profile = await prisma.user.findUnique({ where: { supabaseId: data.user.id } });

  if (!profile) {
    await supabase.auth.signOut();
    return apiError("We couldn't find your profile. Please contact support.", [], 404);
  }

  if (!profile.isActive) {
    await supabase.auth.signOut();
    return apiError("This account has been suspended. Contact support for help.", [], 403);
  }

  await prisma.user.update({ where: { id: profile.id }, data: { lastLogin: new Date() } });

  return apiSuccess({ role: profile.role }, "Logged in successfully.");
}
