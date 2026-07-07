import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { VERIFIED_SUPABASE_ID_HEADER } from "@/lib/supabase/constants";

/**
 * Refreshes the Supabase session for the incoming request and returns the
 * (possibly authenticated) user plus a response carrying the refreshed
 * session cookies. Called once from the root middleware.ts.
 */
export async function updateSession(request: NextRequest) {
  // Never trust a client-supplied copy of this header — strip it
  // unconditionally before (maybe) setting our own verified value below.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete(VERIFIED_SUPABASE_ID_HEADER);

  const cookiesToApply: { name: string; value: string; options?: CookieOptions }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToApply.push(...cookiesToSet);
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    requestHeaders.set(VERIFIED_SUPABASE_ID_HEADER, user.id);
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  cookiesToApply.forEach(({ name, value, options }) => response.cookies.set(name, value, options));

  return { response, user };
}
