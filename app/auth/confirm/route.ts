import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

/**
 * Shared landing point for every emailed Supabase Auth link (signup
 * confirmation, password recovery). Exchanges `token_hash` for a session,
 * then redirects to `next`.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  if (tokenHash && type) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

    if (!error) {
      // Keep Prisma's `isVerified` in sync with Supabase's own confirmation
      // state — verifyOtp() only updates auth.users, so without this the
      // app's own User row would stay permanently "unverified".
      if (data.user?.email_confirmed_at) {
        await prisma.user
          .update({
            where: { supabaseId: data.user.id },
            data: { isVerified: true },
          })
          .catch(() => null);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=confirm_failed`);
}
