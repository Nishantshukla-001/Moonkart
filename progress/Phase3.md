# Phase 3 — Authentication

Status: COMPLETE
Started: 2026-07-03
Finished: 2026-07-03
Updated: 2026-07-03 — refactored from multi-vendor to single-vendor (Seller role removed); remaining docs (Features.md, Vision.md, FolderStructure.md, Pages.md) brought in line in a follow-up documentation pass
Updated: 2026-07-04 — connected to the real Supabase project end-to-end (see "Supabase Go-Live" section below)

## Supabase Go-Live (2026-07-04)

The project was connected to a real Supabase project for the first time. Two root-cause bugs were found and fixed, and the schema was migrated for the first time:

1. **`DIRECT_URL` pointed at an unreachable host.** Supabase's direct connection host (`db.<ref>.supabase.co:5432`) is IPv6-only; this network has no outbound IPv6 route, so anything using it (`prisma migrate`, `db push`) hung until Prisma threw `P1001: Can't reach database server`. Fixed by pointing `DIRECT_URL` at Supabase's **Session Pooler** instead (same Supavisor host, port `5432` — IPv4-compatible, intended by Supabase for exactly this case). `DATABASE_URL` (already on the **Transaction Pooler**, port `6543`) was left pointed at the same host but given `?pgbouncer=true&connection_limit=1`, which Prisma requires against a transaction-mode pooler.
2. **Two env files silently duplicated `DATABASE_URL`/`DIRECT_URL`.** A root `.env` (which the Prisma CLI auto-loads) and `.env.local` (which Next.js loads, with higher precedence) both defined these two variables. They happened to hold identical values, but this is a footgun: editing one and not the other — as happened here — leaves the CLI and the running app pointed at different databases with no visible warning. Consolidated so `DATABASE_URL`/`DIRECT_URL` live **only** in `.env` (both Prisma CLI and Next.js read it); `.env.local` now holds only the Supabase client keys and `NEXT_PUBLIC_SITE_URL`. `.env.example` was rewritten to document the split and the pooler-vs-direct pitfall for future setup.
3. **`isVerified` never synced from Supabase to Prisma.** `app/auth/confirm/route.ts` called `supabase.auth.verifyOtp()` on the emailed confirmation link but never updated the app's own `User.isVerified` column — so a user's row stayed permanently `false` even after they verified their email. Fixed: when `verifyOtp` succeeds and the returned user has `email_confirmed_at` set, the route now updates `prisma.user.update({ where: { supabaseId }, data: { isVerified: true } })`.
4. **First migration created and applied.** No `prisma/migrations` folder existed yet, so the `users` table had never been created in the real database. Ran `npx prisma migrate dev --name init`, which generated `prisma/migrations/20260704123807_init/` and applied it — confirmed via a direct `SELECT` and `prisma.user.count()`.

**Verified end-to-end against the live Supabase project** (using disposable test accounts, deleted afterward from both Supabase Auth and Prisma): register → Prisma row + Supabase Auth identity created → login blocked with "verify your email" until confirmed → confirming via the real `/auth/confirm` link flow correctly flips `isVerified` → login succeeds and sets a session cookie → `/api/auth/me`, `/account`, `/profile` all work while authenticated → `/admin` correctly blocked for a `CUSTOMER` and correctly allowed after promoting the same account to `ADMIN` in Prisma + syncing `user_metadata` → logout invalidates the session (`/api/auth/me` → 401, protected pages redirect again).

**Confirmed still outstanding (needs Supabase Dashboard + Google Cloud Console access, which cannot be done from here):** Google OAuth is **not enabled** on the Supabase project yet — `GET {SUPABASE_URL}/auth/v1/authorize?provider=google` returns `"Unsupported provider: provider is not enabled"`. The application code (`GoogleAuthButton`, `/auth/callback`) is correct and unchanged; enabling it requires creating a Google Cloud OAuth Client (Client ID/Secret) and pasting it into Supabase Dashboard → Authentication → Providers → Google.

**Security note:** during this session, a `DATABASE_URL`/`DIRECT_URL` debugging command briefly printed the database password in plaintext into the terminal output. The user was told to rotate the Supabase database password immediately; this is not a code issue, just an operational follow-up.

Note on numbering: `progress/Phase2.md` already documents the completed
Homepage build. Per user confirmation, this Authentication phase is tracked
here in `Phase3.md` (the next empty file in sequence) rather than
overwriting Phase2.md.

---

## Objectives

Implement the complete authentication and authorization system exactly per
`docs/Authentication.md`, using Supabase Auth (exclusive credential store),
Prisma + PostgreSQL for application data, and Next.js 15 middleware for
route protection — production-ready, TypeScript-strict, and integrated with
the existing premium MoonKart design system without altering the homepage
or any completed Phase 1/2 UI beyond what auth integration required
(Navbar login/user-menu slot).

Governing documents re-read in full before coding: every file in `docs/`
and `design/`.

---

## Business Model Update — Single-Vendor Refactor

MoonKart was originally built as a multi-vendor marketplace with a Seller
role, seller registration/approval workflow, and seller dashboard. The
business model changed to **single-vendor**: the Admin is the store's sole
owner and seller. Customers can only browse and purchase — no customer can
ever become a seller. This phase's authentication system was refactored
accordingly:

- Removed the `SELLER` role from RBAC, middleware, Prisma, and every UI
  surface. Only `CUSTOMER` and `ADMIN` remain.
- Removed the entire seller registration → admin approval → seller
  dashboard workflow, its Prisma model (`SellerProfile`), its API routes,
  its pages, and its feature module (`features/seller/`).
- Admin absorbed every seller capability (product/inventory/order/coupon
  management) directly, per the updated `docs/Authentication.md`.
- `docs/Authentication.md`, `docs/Database.md`, and `docs/API.md` were
  updated to reflect the two-role, single-vendor model.

The rest of this document describes the **current, single-vendor** state of
the Authentication phase — it does not separately narrate the removed
multi-vendor implementation.

---

## Dependencies Added

- `@supabase/supabase-js`, `@supabase/ssr` — Supabase Auth client/server SDKs
- `prisma`, `@prisma/client` (pinned to **6.19.3**, not the newly-released
  Prisma 7, to keep the stack on a stable, widely-documented major version
  per TechStack.md's "modern, stable, production-ready" philosophy)
- `zod` (v4), `react-hook-form`, `@hookform/resolvers` — form validation
- `server-only` — build-time guard so `lib/auth.ts` can never be imported
  into a Client Component bundle

---

## Files Created

### Environment & Database
- `.env.example`, `.env.local` — Supabase URL/keys, `DATABASE_URL`/`DIRECT_URL`, `NEXT_PUBLIC_SITE_URL` (placeholders; real Supabase project credentials must be filled in before this is usable end-to-end)
- `prisma/schema.prisma` — a single `User` model + `UserRole` (`CUSTOMER`/`ADMIN`), `AuthProvider` enums, matching `docs/Database.md` §2 exactly (camelCase fields, snake_case columns via `@map`/`@@map`, UUID primary keys). Only the Authentication-relevant model is defined — Product/Order/Cart/etc. are left for their own future phases.
- `lib/prisma.ts` — Prisma client singleton (dev hot-reload safe)

### Supabase Integration
- `lib/supabase/client.ts` — browser client (Client Components)
- `lib/supabase/server.ts` — server client (Server Components/Route Handlers), accepts optional `cookieOptions` used by the login route to implement Remember Me
- `lib/supabase/middleware.ts` — session-refresh helper used by root middleware
- `lib/supabase/admin.ts` — service-role client for privileged server-only actions (never imported client-side)

### Authorization
- `middleware.ts` (root) — refreshes the Supabase session every request and does fast, Edge-safe route gating for `/account`, `/profile`, `/orders`, `/checkout` (any authenticated user) and `/admin/**` (ADMIN only), using the role mirrored into the Supabase session's `user_metadata`
- `lib/auth.ts` — server-only, Prisma-authoritative helpers: `getCurrentUser`, `requireUser`, `requireRole`, `requireAdmin`, `syncSupabaseUserRole`
- `lib/authErrors.ts` — maps raw Supabase error text to the user-friendly messages required by Authentication.md's Error Handling section
- `lib/apiResponse.ts` — `apiSuccess`/`apiError` — the consistent JSON envelope required by `docs/API.md`
- `lib/validations.ts` — shared Zod primitives (`emailSchema`, `passwordSchema` enforcing the 8-char/upper/lower/number/symbol policy, `phoneSchema`, `nameSchema`)

### State & Types
- `providers/AuthProvider.tsx` + `hooks/useAuth.ts` — client-side reactive auth state (Supabase session + Prisma profile), used by the Navbar/UserMenu; wired into `providers/Providers.tsx`
- `types/user.ts` — `IUser` (aliased to the Prisma `User` model — single source of truth, no duplicated field list)

### UI Primitives (shadcn/Base UI, styled per design/Components.md)
- `components/ui/checkbox.tsx`, `components/ui/form.tsx` (React Hook Form wiring), `components/ui/alert.tsx`
- `components/shared/GoogleIcon.tsx` — standard 4-color Google mark (lucide-react ships no brand icons, same reasoning as the existing `InstagramIcon.tsx`)

### Feature Modules
- `features/auth/validation/auth.schema.ts` — register/login/forgotPassword/resetPassword/changePassword Zod schemas
- `features/auth/services/auth.service.ts` — client-side fetch wrapper around every auth API route, plus `signInWithGoogle` (the one action that must be client-initiated)
- `features/auth/components/` — `AuthCard`, `LoginForm`, `SignupForm`, `ForgotPasswordForm`, `ResetPasswordForm`, `ChangePasswordForm`, `ProfileForm`, `GoogleAuthButton`, `VerifyEmailNotice`, `UserMenu`

### Pages
- `app/auth/login/page.tsx`, `app/auth/signup/page.tsx`, `app/auth/forgot-password/page.tsx`, `app/auth/reset-password/page.tsx`, `app/auth/verify-email/page.tsx`
- `app/auth/callback/route.ts` — Google OAuth PKCE code exchange + Prisma profile sync
- `app/auth/confirm/route.ts` — shared landing point for every emailed Supabase link (signup confirmation, password recovery) via `verifyOtp`
- `app/profile/page.tsx` — edit profile + change password (protected)
- `app/account/page.tsx` — customer account hub (protected), with an Admin-only banner linking into the Admin Dashboard
- `app/admin/page.tsx` — Admin Dashboard landing (protected, `ADMIN` only): a real, RBAC-verified page listing every management area (Products, Categories, Orders, Coupons, Banners, Customers, Reviews, Analytics, Settings) as honest "Coming soon" cards, since those modules are separate future phases

### API Routes (`docs/API.md` §2–3)
- `app/api/auth/{register,login,logout,forgot-password,reset-password,verify-email,me}/route.ts`
- `app/api/profile/route.ts` (GET/PUT), `app/api/profile/password/route.ts` (PUT — Change Password)

## Files Modified

- `components/navigation/Navbar.tsx` — the static "Login" button is now `UserMenu` (desktop) / an auth-aware block (mobile sheet): shows Login when signed out, or an avatar dropdown (My Account, Admin Dashboard link for admins, Logout) when signed in. No other homepage/Phase 1–2 UI was touched.
- `providers/Providers.tsx` — added `AuthProvider` to the root provider tree
- `constants/routes.ts` — `admin`, `adminDashboard` route constants (all seller-related route constants were added then removed during the single-vendor refactor)
- `constants/roles.ts` — `UserRole` now holds exactly `CUSTOMER` and `ADMIN`
- `app/robots.ts` — disallow list no longer references a `/seller` path

---

## Requirements Checklist (docs/Authentication.md)

- [x] Supabase Auth as the exclusive credential store — no password column anywhere in Prisma
- [x] Email & Password Sign Up / Login
- [x] Google OAuth (Login + Signup, treated as pre-verified)
- [x] Email Verification (confirmation link + resend action)
- [x] Forgot Password / Reset Password
- [x] Change Password (re-authenticates with the current password first, since Supabase has no standalone "verify password" call)
- [x] Remember Me (session-only vs. persistent auth cookie — see Decisions)
- [x] Secure JWT session via Supabase, refreshed every request by middleware
- [x] Protected Routes for Customer and Admin (single-vendor — no Seller routes)
- [x] Middleware-based route gating
- [x] RBAC — two roles (Customer/Admin), enforced twice: fast Edge check in middleware + authoritative Prisma check on every protected page
- [x] Admin Login (no public admin registration; role is set directly in the database)
- [x] Prisma integration
- [x] TypeScript strict mode (already project-wide; no `any` introduced)
- [x] User-friendly error handling, never leaking internal error text

---

## Decisions Made

1. **Prisma pinned to v6, not v7.** `npm install prisma @prisma/client` resolved to the just-released Prisma 7 (breaking client-generation changes). Downgraded to the stable 6.x line for a "modern, stable, production-ready" stack per TechStack.md.
2. **Two-layer RBAC.** Middleware (Edge runtime) reads `role` from the Supabase session's `user_metadata` for a fast redirect — it never touches Prisma. Every protected Server Component independently re-verifies via `lib/auth.ts` against the Prisma `User` row, which is the true source of truth. A stale/missing `user_metadata.role` can only cause an unnecessary redirect, never a privilege escalation.
3. **Single-vendor: no Seller role.** MoonKart is a single-vendor store — the Admin is the sole business owner and seller. There is no seller registration, approval workflow, seller dashboard, or seller-scoped API namespace. Product/order/coupon/inventory/customer/review/banner/analytics/settings management all belong to Admin directly (`docs/Authentication.md` §User Roles).
4. **Remember Me implemented via cookie lifetime, not Supabase token expiry.** `lib/supabase/server.ts`'s `createClient()` accepts `cookieOptions`; the login route passes `{ maxAge: undefined }` (session-only cookie) when "Remember Me" is unchecked, and the library's persistent 400-day default otherwise.
5. **All Supabase mutations happen server-side**, via Route Handlers (register/login/logout/forgot/reset/change-password) — the browser Supabase client is used only for reactive `onAuthStateChange` listening and for the one action that must originate client-side: `signInWithOAuth` (Google), which needs to redirect the whole page.
6. **Supabase Dashboard email templates.** The default Supabase "Confirm signup" / "Reset password" templates use `{{ .ConfirmationURL }}`, which respects the `emailRedirectTo` passed in code (`/auth/confirm?next=...`) — no extra dashboard configuration should be required for a stock Supabase project, but this should be verified once real project credentials are added.
7. **No custom rate limiting.** TechStack.md does not specify a rate-limiting store (e.g. Redis/Upstash), and Supabase Auth already applies its own server-side rate limits to auth endpoints. Adding a bespoke rate limiter would be a new, unrequested dependency — deferred.
8. **Resend (transactional email) not wired up.** Supabase Auth sends its own verification/reset emails natively — no Resend integration was needed for *this* phase. Resend is still the documented provider for order confirmations, welcome emails, and other notifications once those features/phases exist.
9. **Scope kept to Authentication, not full dashboards.** `/admin` renders a real, RBAC-verified page but not the full analytics/product/order management UI described in `docs/Features.md` — those belong to their own future phases. `/account` links to Orders/Wishlist/Addresses are shown as honest "Coming soon" cards rather than dead links, since those pages don't exist yet.
10. **Account deletion (`DELETE /api/profile` in API.md) was not implemented.** It isn't mentioned in `docs/Authentication.md`'s scope and deleting a Supabase identity + cascading Prisma data deserves its own careful design later.
11. **Documentation follow-up completed.** `docs/Features.md`, `docs/Vision.md`, `docs/FolderStructure.md`, and `design/Pages.md` originally described the old multi-vendor model (Seller Dashboard, seller registration pages, etc.). They were left untouched in the initial single-vendor refactor (scoped only to `docs/Authentication.md`, `docs/Database.md`, `docs/API.md`, and this file) and updated in a dedicated follow-up pass: Seller Features/Pages content was merged into Admin (product, inventory, order, and coupon management now documented as direct Admin capabilities), and all "multi-vendor marketplace" business-model language was rewritten to describe MoonKart as a single-vendor store. `docs/ClientInfo.md`'s "Business Type" field was flagged as still reflecting the old model rather than being changed unprompted, since it's the client's own source-of-truth document — the user then explicitly requested the update, and it now reads "Single-Vendor E-Commerce Fashion & Lifestyle Store."

---

## Verification

- `npm run lint` — ✓ 0 errors
- `npm run build` — ✓ compiles successfully, 0 TypeScript errors. One expected, non-blocking warning: `@supabase/ssr` references a Node.js API inside the Edge-runtime `middleware.ts` bundle — this is a well-known, cosmetic warning common to every Supabase+Next.js Edge-middleware project and does not affect functionality.
- `npm run dev` — ✓ verified without a live Supabase project connected:
  - Public pages (`/`, `/auth/login`, `/auth/signup`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/verify-email`) all return HTTP 200
  - Protected pages (`/profile`, `/account`, `/admin`) all correctly redirect (307) to `/auth/login?redirectTo=...` when unauthenticated
  - API routes return well-formed JSON error envelopes (never a raw 500) even against placeholder Supabase credentials
  - No console or dev-server errors; no stray dev server processes left running afterward

---

## Remaining Work / Known Limitations

- **Requires a real Supabase project to actually function.** `.env.local` currently holds placeholder values. Before this can be used live: create a Supabase project, run `npx prisma migrate dev` against its Postgres connection string, enable the Google provider in Supabase Auth, and fill in `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` / `DATABASE_URL` / `DIRECT_URL`.
- Cloudinary-based uploads (product images, avatar) are out of scope for this phase.
- Full Admin management UI (products, orders, coupons, banners, customers, reviews, analytics, settings) is a separate future phase; only the RBAC-gated dashboard shell exists now.
- Account deletion, "Logout from all devices," 2FA, and other items explicitly marked "Future Version" in Authentication.md were not built, per the doc's own scope.
None remaining — `docs/ClientInfo.md` has since been updated at the user's request (see Decision 11).

Stopping here — Phase 3 (Authentication) is complete, refactored to single-vendor, and verified. Awaiting review before starting the next phase.
