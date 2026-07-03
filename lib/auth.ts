import "server-only";

import type { User } from "@prisma/client";
import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { UserRole } from "@/constants/roles";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

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
export async function getCurrentUser(): Promise<User | null> {
  const supabaseUser = await getSupabaseUser();
  if (!supabaseUser) return null;

  return prisma.user.findUnique({ where: { supabaseId: supabaseUser.id } });
}

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
 * Mirrors `role` into the Supabase Auth user's `user_metadata` so the Edge
 * middleware can gate routes without querying Prisma. Called after
 * registration.
 */
export async function syncSupabaseUserRole(supabaseId: string, role: UserRole) {
  const admin = createAdminClient();
  await admin.auth.admin.updateUserById(supabaseId, { user_metadata: { role } });
}
