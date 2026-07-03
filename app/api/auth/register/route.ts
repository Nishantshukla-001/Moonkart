import type { NextRequest } from "next/server";

import { UserRole } from "@/constants/roles";
import { registerSchema } from "@/features/auth/validation/auth.schema";
import { syncSupabaseUserRole } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { mapSupabaseAuthError } from "@/lib/authErrors";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return apiError("Invalid request body.", [], 400);
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "Validation failed.",
      parsed.error.issues.map((issue) => issue.message),
      422
    );
  }

  const { firstName, lastName, email, phone, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return apiError("An account with this email already exists.", [], 409);
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: firstName, last_name: lastName, role: UserRole.CUSTOMER },
      emailRedirectTo: `${siteUrl}/auth/confirm?next=/auth/verify-email`,
    },
  });

  if (error || !data.user) {
    return apiError(mapSupabaseAuthError(error?.message ?? ""), [], 400);
  }

  try {
    await prisma.user.create({
      data: {
        supabaseId: data.user.id,
        firstName,
        lastName,
        email,
        phone,
        role: UserRole.CUSTOMER,
        authProvider: "EMAIL",
        isVerified: false,
      },
    });
  } catch {
    const admin = createAdminClient();
    await admin.auth.admin.deleteUser(data.user.id).catch(() => null);
    return apiError("Could not create your profile. Please try again.", [], 500);
  }

  await syncSupabaseUserRole(data.user.id, UserRole.CUSTOMER).catch(() => null);

  return apiSuccess(
    { requiresEmailVerification: !data.session },
    "Account created. Check your email to verify your account.",
    201
  );
}
