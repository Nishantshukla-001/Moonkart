import { NextResponse, type NextRequest } from "next/server";

import { ROUTES } from "@/constants/routes";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Coarse-grained authentication gate only — checks that a session exists,
 * nothing more. This runs on every request in the Edge runtime, so it never
 * touches Prisma/Postgres.
 *
 * Role-based authorization is NOT done here. Supabase's `user_metadata.role`
 * is only ever set at signup (always `CUSTOMER`) and has no path to reflect
 * a Prisma-only role change (e.g. promoting a user to ADMIN directly in the
 * database), so gating on it here would incorrectly lock out real admins
 * whose metadata never got synced. Every protected Server Component
 * re-verifies the authoritative role via `lib/auth.ts` (Prisma) before
 * rendering — that is the sole enforcement point for role checks.
 *
 * MoonKart is single-vendor: only Customer and Admin routes exist.
 */
const CUSTOMER_ROUTES = ["/account", "/profile", "/orders", "/checkout"];
const ADMIN_ROUTES = ["/admin"];

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const requiresAuth =
    matchesPrefix(pathname, CUSTOMER_ROUTES) || matchesPrefix(pathname, ADMIN_ROUTES);

  if (!requiresAuth) {
    return response;
  }

  if (!user) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Handled here (a plain HTTP redirect before any React render) rather than
  // via `redirect()` in app/admin/page.tsx, which — for a full top-level
  // navigation straight to "/admin" — produced a spurious dev-mode
  // "Rendered more hooks than during the previous render" warning during
  // the client's initial hydration. app/admin/page.tsx keeps its own
  // `redirect()` as a defense-in-depth fallback; this branch means it never
  // actually has to fire in normal operation.
  if (pathname === "/admin") {
    return NextResponse.redirect(new URL(ROUTES.adminDashboard, request.url));
  }

  return response;
}

export const config = {
  // Scoped to exactly the route trees `requiresAuth` above checks
  // (CUSTOMER_ROUTES + ADMIN_ROUTES). `updateSession()` calls
  // `supabase.auth.getUser()`, a real network round trip to Supabase's Auth
  // server — the previous catch-all matcher meant every single navigation
  // and every `/api/*` call paid that cost, even though the verified-id
  // header this sets (see VERIFIED_SUPABASE_ID_HEADER) is only ever read by
  // `getCurrentUser()` (lib/auth.ts), which already independently
  // re-verifies whenever that header is absent. So this narrower matcher
  // cannot make any individual request slower — it only removes the cost
  // for requests that were never using the header anyway.
  matcher: ["/account/:path*", "/profile/:path*", "/orders/:path*", "/checkout/:path*", "/admin/:path*"],
};
