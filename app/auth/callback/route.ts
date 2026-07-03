import { NextResponse, type NextRequest } from "next/server";

import { UserRole } from "@/constants/roles";
import { syncSupabaseUserRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth (Google) callback — exchanges the PKCE `code` for a session, then
 * creates or syncs the Prisma profile, per docs/Authentication.md's
 * "Google Login" flow (role defaults to Customer, authProvider GOOGLE,
 * treated as email-verified automatically).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=oauth`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user || !data.user.email) {
    return NextResponse.redirect(`${origin}/auth/login?error=oauth`);
  }

  const existing = await prisma.user.findUnique({ where: { supabaseId: data.user.id } });

  if (!existing) {
    const fullName = (data.user.user_metadata?.full_name as string | undefined) ?? "";
    const [firstName, ...rest] = fullName.split(" ").filter(Boolean);

    try {
      await prisma.user.create({
        data: {
          supabaseId: data.user.id,
          firstName: firstName || "MoonKart",
          lastName: rest.join(" ") || "Customer",
          email: data.user.email,
          avatar: (data.user.user_metadata?.avatar_url as string | undefined) ?? null,
          role: UserRole.CUSTOMER,
          authProvider: "GOOGLE",
          isVerified: true,
          lastLogin: new Date(),
        },
      });
    } catch {
      return NextResponse.redirect(`${origin}/auth/login?error=account_exists`);
    }

    await syncSupabaseUserRole(data.user.id, UserRole.CUSTOMER).catch(() => null);
  } else {
    await prisma.user.update({ where: { id: existing.id }, data: { lastLogin: new Date() } });
  }

  return NextResponse.redirect(`${origin}${next}`);
}
