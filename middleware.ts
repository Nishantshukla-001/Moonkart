import { NextResponse, type NextRequest } from "next/server";

import { UserRole } from "@/constants/roles";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Coarse-grained, fast route gating using the role stored in the Supabase
 * session's `user_metadata` (set at signup). This runs on every request in
 * the Edge runtime, so it never touches Prisma/Postgres.
 *
 * It is the first line of defense only — every protected Server Component
 * re-verifies the authoritative role via `lib/auth.ts` (Prisma) before
 * rendering, so a stale or missing metadata role can never grant access,
 * only cause an unnecessary redirect.
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

  const role = (user.user_metadata?.role as UserRole | undefined) ?? UserRole.CUSTOMER;

  if (matchesPrefix(pathname, ADMIN_ROUTES) && role !== UserRole.ADMIN) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets and image optimization,
     * so the Supabase session cookie is refreshed on every navigation.
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.jpg|.*\\.(?:svg|png|jpg|jpeg|webp|gif)$).*)",
  ],
};
