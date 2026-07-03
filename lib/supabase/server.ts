import type { CookieOptionsWithName } from "@supabase/ssr";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client for Server Components, Route Handlers, and Server Actions.
 * Must be created fresh per request — never shared across requests.
 *
 * `cookieOptions` lets the login route implement "Remember Me": pass
 * `{ maxAge: undefined }` to write a session-only auth cookie instead of
 * the library's persistent (400-day) default.
 */
export async function createClient(cookieOptions?: CookieOptionsWithName) {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions,
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component render, which cannot set
            // cookies. Safe to ignore — middleware refreshes the session
            // on every request.
          }
        },
      },
    }
  );
}
