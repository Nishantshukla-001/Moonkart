import "server-only";

import type { User } from "@prisma/client";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { cache } from "react";

import { ROUTES } from "@/constants/routes";
import { UserRole } from "@/constants/roles";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { VERIFIED_SUPABASE_ID_HEADER } from "@/lib/supabase/constants";

/**
 * The verified Supabase Auth identity for the current request, or null.
 * Uses `getUser()` (not `getSession()`) so the token is revalidated against
 * the Auth server rather than trusted from cookies alone.
 */
export async function getSupabaseUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * The application's `User` row for the current request, matched by
 * `supabaseId`. This — not the Supabase identity — is the authoritative
 * source for role and account state (`isActive`, `isVerified`, etc.).
 */
/**
 * Wrapped in `React.cache()` so multiple calls within the same request (e.g.
 * an admin layout's `requireAdmin()` and a nested page both needing the
 * user) share one lookup instead of re-verifying/re-querying per call.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  // Middleware (lib/supabase/middleware.ts) already calls Supabase's Auth
  // API to verify this exact request's session before it ever reaches here.
  // If that verified id was forwarded, reuse it instead of paying for a
  // second, redundant verification round trip. The header can never be
  // client-spoofed — middleware unconditionally strips any inbound copy
  // before (maybe) setting its own value.
  const headerList = await headers();
  const verifiedId = headerList.get(VERIFIED_SUPABASE_ID_HEADER);

  let supabaseId: string | null;
  if (verifiedId) {
    supabaseId = verifiedId;
  } else {
    const supabaseUser = await getSupabaseUser();
    supabaseId = supabaseUser?.id ?? null;
  }
  if (!supabaseId) return null;

  return prisma.user.findUnique({ where: { supabaseId } });
});

/** Redirects to Login if there is no authenticated, active user. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();

  if (!user || !user.isActive) {
    redirect(ROUTES.login);
  }

  return user;
}

/** Redirects Home if the authenticated user does not hold one of `roles`. */
export async function requireRole(roles: UserRole[]): Promise<User> {
  const user = await requireUser();

  if (!roles.includes(user.role as UserRole)) {
    redirect(ROUTES.home);
  }

  return user;
}

export async function requireAdmin(): Promise<User> {
  return requireRole([UserRole.ADMIN]);
}

/**
 * Non-redirecting Admin check for Route Handlers (`redirect()` is only valid
 * from Server Components/Server Actions). Returns null instead of throwing
 * so callers can respond with a proper JSON 401/403 via `apiError`.
 */
export async function getCurrentAdmin(): Promise<User | null> {
  const user = await getCurrentUser();
  if (!user || !user.isActive || user.role !== UserRole.ADMIN) return null;
  return user;
}

/**
 * Mirrors `role` into the Supabase Auth user's `user_metadata` so the Edge
 * middleware can gate routes without querying Prisma. Called after
 * registration.
 */
export async function syncSupabaseUserRole(supabaseId: string, role: UserRole) {
  const admin = createAdminClient();
  await admin.auth.admin.updateUserById(supabaseId, { user_metadata: { role } });
}
