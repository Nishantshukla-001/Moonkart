# MoonKart

A multi-vendor fashion, beauty, and lifestyle marketplace built with Next.js 15 (App Router), Prisma/PostgreSQL (Supabase), and Supabase Auth.

## Stack

- **Framework:** Next.js 15 (App Router, React 19, TypeScript, strict mode)
- **Database:** PostgreSQL via Supabase, accessed through Prisma
- **Auth:** Supabase Auth (email/password), session managed via `@supabase/ssr`
- **Images:** Cloudinary (signed direct browser-to-Cloudinary uploads)
- **Styling:** Tailwind CSS v4
- **State:** Zustand (cart, wishlist)

## Prerequisites

- Node.js 20+
- A Supabase project (free tier is fine)
- A Cloudinary account

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

   `postinstall` automatically runs `prisma generate` — you don't need to run it separately.

2. **Environment variables**

   Copy `.env.example` and split it into two files exactly as the comments in that file describe:
   - `.env` — `DATABASE_URL` and `DIRECT_URL` (used by both Prisma CLI and the app)
   - `.env.local` — everything else (Supabase keys, Cloudinary keys, site URL)

   Get the Supabase values from **Project Settings → Database** (connection strings) and **Project Settings → API** (URL, anon key, service role key). Get the Cloudinary values from your Cloudinary dashboard home.

   **Before going live**, set `NEXT_PUBLIC_SITE_URL` to your real production domain — it feeds every canonical URL, Open Graph tag, sitemap entry, and JSON-LD structured-data field across the site (see `constants/config.ts`).

3. **Database**

   ```bash
   npx prisma migrate deploy   # apply existing migrations
   npx prisma db seed          # optional — seeds a small Apparel catalog for local dev
   ```

   For local schema changes during development, use `npx prisma migrate dev` instead of `deploy`.

4. **Run it**

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000`. The admin panel is at `/admin` — the first user needs their `role` set to `ADMIN` directly in the `User` table (there's no self-service admin signup, by design).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Type-check without emitting |
| `npx prisma studio` | Browse the database visually |

## Deployment (Vercel)

This project deploys to Vercel with zero extra config beyond environment variables — set every variable from `.env.example` in the Vercel project settings (Production + Preview). `postinstall: prisma generate` is already wired up in `package.json`, so Vercel's build will always regenerate the Prisma Client on install.

Run `npx prisma migrate deploy` against your production database before or during your first deploy (Vercel does not do this automatically) — and again after any future migration.

## Backups

Database backups are handled at the Supabase platform level, not by this application. Confirm your Supabase project's plan tier includes the backup/point-in-time-recovery window you need (the free tier has a much shorter retention window than paid tiers) — check **Project Settings → Database → Backups**.

## Known gaps before real production traffic

- **Payments:** checkout is currently Cash-on-Delivery only. No payment gateway (Razorpay or otherwise) is wired in yet.
- **Error monitoring:** no Sentry (or equivalent) is installed — production errors are only visible in Vercel's function logs.
- **Analytics:** no customer-facing analytics (GA4/Plausible/etc.) is installed. `/admin/analytics` is an internal sales dashboard only, not visitor tracking.
- **Rate limiting:** a basic in-memory limiter protects login/signup/password-reset/checkout, but it resets per serverless instance — swap in a shared store (e.g. Upstash Redis) before relying on it at scale.

See the production-readiness audit for the full list.
