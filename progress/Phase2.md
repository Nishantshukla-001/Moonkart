# Phase 2 — Premium Storefront Homepage

Status: COMPLETE
Started: 2026-07-02
Finished: 2026-07-02

---

## Objectives

Build a complete, production-quality premium homepage for MoonKart — all 14 required sections, using only MoonKart branding (logo, colors, typography, components), with berrymuch.in used strictly as structural/mood inspiration (never copied). No demo/placeholder-looking output, no empty sections, no Lorem Ipsum.

Governing documents re-read in full before coding: `docs/*`, `design/*`, `prompts/MasterPrompt.md` (including the new "Visual Design Requirement" section).

---

## Files Created

### Homepage sections & shared components
- `components/layout/AnnouncementBar.tsx` — rotating free-shipping/brand messages, Framer Motion crossfade, fully responsive.
- `components/shared/Reveal.tsx` — reusable scroll-reveal wrapper (`Reveal`, `RevealItem`) built on `lib/motion.ts` variants; used by every homepage section for consistent entrance animation instead of duplicating Framer Motion boilerplate per section.
- `lib/motion.ts` — shared Framer Motion variants (`fadeInUp`, `staggerContainer`).
- `components/products/ProductSection.tsx` — single reusable section (title/subtitle/grid/"View All") powering Trending Products, New Arrivals, and Best Sellers with zero duplicated markup. Includes local wishlist-toggle and add-to-cart UI state (toast feedback only, no persistence).
- `components/products/ProductCardSkeleton.tsx`, `components/categories/CategoryCardSkeleton.tsx` — skeleton loaders matching the real card layouts exactly, ready to drop into Suspense boundaries once Phase 3 wires real async data.
- `components/shared/PromoBanner.tsx` — full-width promotional banner (reusable: eyebrow/heading/subheading/CTA/background image).
- `components/shared/CollectionCard.tsx` — editorial image-with-text-overlay card for Featured Collections (visually distinct from `CategoryCard` on purpose — collections are curated editorial groupings, not taxonomy).
- `components/shared/WhyChooseUs.tsx` — 4-item trust/feature grid (Authentic Products, Secure Payments, Easy Returns, Premium Packaging).
- `components/shared/TestimonialCard.tsx` — star rating + quote + initials avatar (no fake customer photos).
- `components/shared/InstagramGallery.tsx` — 6-image grid linking out to the real `@_moonkart` profile from `constants/config.ts`.
- `components/shared/NewsletterForm.tsx` — extracted from the Footer into a reusable component (`compact`/`large` variants) so the homepage Newsletter section and the Footer's newsletter field share one implementation instead of duplicating form logic.
- `components/shared/NewsletterSection.tsx` — large promotional newsletter section using `NewsletterForm` (`large` variant).
- `lib/placeholderData.ts` — typed, centralized placeholder content (categories, trending/new/best-seller products, featured collections, testimonials, Instagram images). Clearly documented as temporary and not database-backed.

## Files Modified

- `app/page.tsx` — replaced the default Next.js scaffold page entirely with the full homepage (Hero → Featured Categories → Trending Products → New Arrivals → Promo Banner → Best Sellers → Featured Collections → Why Choose MoonKart → Testimonials → Instagram Gallery → Newsletter).
- `app/layout.tsx` — added `<AnnouncementBar />` above the `Navbar` (site-wide, since it visually sits above the sticky nav on every page).
- `components/shared/HeroSection.tsx` — added Framer Motion staggered entrance animation, an optional `eyebrow` label, and a second (secondary) CTA button, per the Phase 2 hero requirements.
- `components/navigation/Navbar.tsx` — replaced the static "Categories" link with a working dropdown menu (shadcn `DropdownMenu`) populated from `lib/placeholderData.ts`, on both desktop and the mobile sheet.
- `components/footer/Footer.tsx` — now uses the shared `NewsletterForm` instead of an inline duplicate form.
- `next.config.ts` — added `images.remotePatterns` for `picsum.photos` / `fastly.picsum.photos` (placeholder photography only).

---

## Components Created (new, reusable)

AnnouncementBar, Reveal/RevealItem, ProductSection, ProductCardSkeleton, CategoryCardSkeleton, PromoBanner, CollectionCard, WhyChooseUs, TestimonialCard, InstagramGallery, NewsletterForm, NewsletterSection.

Combined with the Phase 1 library (Navbar, Footer, Container, Button, Input, Card, Modal, CartDrawer, WishlistButton, ProductCard, ProductBadge, CategoryCard, Breadcrumb, Pagination, EmptyState, Spinner/PageLoading, Sidebar, DashboardCard), the homepage is built entirely from reusable components — no one-off markup duplicated across sections.

---

## Features Completed

All 14 required homepage sections, in the required order:

1. Announcement Bar — animated, responsive, site-wide
2. Premium Navigation — sticky, logo, search, **Categories dropdown**, wishlist, cart, login, mobile sheet menu
3. Hero Section — Framer Motion staggered entrance, dual CTAs, eyebrow label
4. Featured Categories — 6 categories (Fine Jewellery, Beauty & Skincare, Apparel, Bags & Accessories, Footwear, Home & Lifestyle)
5. Trending Products
6. New Arrivals
7. Best Sellers
8. Promotional Banner (uses `assets/pastelyelow.jpeg`)
9. Featured Collections (Bridal Edit, Everyday Gold, Summer Pastels, Office Elegance)
10. Why Choose MoonKart
11. Customer Testimonials (4 original, non-generic testimonials)
12. Instagram Gallery (linked to the real `@_moonkart` account)
13. Newsletter (large promotional section, uses `assets/greencolor.jpeg`)
14. Premium Footer

All copy is original (no Lorem Ipsum); all styling uses only `Colors.md`/`Typography.md`/`Components.md` tokens already wired in Phase 1.

---

## Design Inspiration Handling

Reviewed berrymuch.in via a structural/stylistic description only (sticky nav with category dropdown, full-width hero, horizontal product sections, card-based grids with badges, generous whitespace, neutral backgrounds letting imagery lead). Applied as UX *patterns* only — every color, font, logo, copy line, and layout composition on the MoonKart homepage is original and sourced from MoonKart's own docs and assets. Nothing was copied from berrymuch.in.

---

## Decisions Made

1. **Placeholder photography via Lorem Picsum.** `assets/` contains the MoonKart logo and three flat brand-color swatches (blush/sage/pastel-yellow) — no product photography. Per the instruction to use "high-quality placeholder images" until real photos exist, product/category/collection/Instagram imagery uses deterministic-seed Lorem Picsum URLs (stable per seed, so the same "product" always shows the same image). This is documented here as temporary; swapping to real photography later only requires updating `lib/placeholderData.ts`.
2. **Brand color assets used for texture, not products.** `pastelyelow.jpeg` → Promotional Banner background, `greencolor.jpeg` → Newsletter section background, matching their documented purpose in `Colors.md` ("Promotional Sections, Offer Cards" for yellow). `pinkcolor.jpeg` remains available for a future promotional moment (e.g. a sale-themed section) — not forced in just to use all three.
3. **AnnouncementBar placed in the root layout, not just the homepage.** It visually sits directly above the sticky Navbar on every page, so it lives in `app/layout.tsx` rather than being homepage-only.
4. **No fake async delay for skeleton components.** Skeleton loaders (`ProductCardSkeleton`, `CategoryCardSkeleton`) were built and match their real components exactly, but are not wired into an artificial `Suspense` delay on this static homepage — that would be a gimmick. They're ready for Phase 3+ when product data comes from a real API.
5. **Local UI-only interactivity.** Wishlist-toggle and add-to-cart on `ProductSection` update local component state and show a toast — no cart/wishlist persistence, no API calls, no database. Real cart/wishlist logic is out of scope until the relevant backend phase.

---

## Verification

- `npm run build` — ✓ compiles successfully, 0 TypeScript errors, all routes statically generated.
- `npm run lint` — ✓ 0 ESLint errors.
- `npm run dev` — ✓ homepage returns HTTP 200, all 14 section headings present in the rendered HTML, Next.js Image optimizer successfully proxies placeholder images (verified via direct request), no errors or warnings in the dev server log.
- Manually confirmed no stray/stale dev server processes were left running afterward.

---

## Remaining Work / Known Limitations

- Homepage only — Products, Categories, Cart, Wishlist, Checkout, Auth, Seller, and Admin pages are still unbuilt (later phases).
- All product/category/collection data is static placeholder content in `lib/placeholderData.ts`, not from a database — no Prisma schema or Supabase wiring exists yet.
- Wishlist/cart interactions on the homepage are local UI state only (toast feedback), not persisted.
- Placeholder photography (Lorem Picsum) is generic, not actually jewellery/beauty/fashion-themed — acceptable as temporary per the instructions, but should be replaced with real or theme-matched photography before launch.
- No dark mode toggle exposed (tokens ready from Phase 1, still deferred to a future version per `docs/Vision.md`).

Stopping here per instructions — Phase 3 has not been started, awaiting review.
