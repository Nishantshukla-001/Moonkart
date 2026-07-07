# Phase 4 — Core E-Commerce Foundation

Status: COMPLETE
Started: 2026-07-05
Finished: 2026-07-05

Note on numbering: the user referred to this work as "Phase 3" in their prompt, but `progress/Phase3.md` already documents the completed Authentication phase. Per the established precedent in this project (the same question was asked and answered during the Authentication phase), this work is tracked in `Phase4.md` — the next empty file in sequence — rather than overwriting Phase3.md.

---

## Objectives

Build the core shopping foundation on top of the completed Authentication system: catalog data model (Category/Subcategory/Brand/Product/Images/Variants), Admin CRUD APIs, customer-facing browsing (listing/detail/category/brand/search with filter/sort/pagination), and a persistent Cart + Wishlist with guest-cart support and merge-on-login — all using the existing pink/cream/sage design system (the prompt's "Purple luxury branding" was confirmed with the user to be a mismatch with this project and was not applied).

Governing documents re-read before coding: `README.md`, `docs/FolderStructure.md`, `docs/CodingStandards.md`, `docs/Authentication.md`, `docs/ClientInfo.md`, `progress/Phase3.md`, plus `docs/Database.md` and `docs/API.md` for the existing schema/endpoint contracts. Authentication code was not modified except where genuinely required for integration (Navbar now receives real categories and a cart badge; see Files Modified).

---

## Database Changes

Added to `prisma/schema.prisma` and migrated with `npx prisma migrate dev --name add_catalog_cart_wishlist`:

- **Category** — top-level taxonomy (name, slug, image, description, isActive).
- **SubCategory** — a second explicit taxonomy level under Category (own table, not a self-relation on Category, since the brief listed it as its own model).
- **Brand** — name, slug, logo, description, isActive.
- **Product** — categoryId (required), subCategoryId/brandId (optional), name, slug, shortDescription, description, sku, price, salePrice, stock, weight, dimensions, thumbnail, averageRating, reviewCount, isFeatured, isBestSeller, isPublished, hasVariants. Prices are whole-rupee integers, matching the existing frontend (`formatCurrency`, placeholder data) rather than introducing `Decimal`.
- **ProductImage** — productId, imageUrl, displayOrder.
- **ProductVariant** — productId, size, color, sku, price, salePrice, stock, image, isDefault.
- **Cart** / **CartItem** — one Cart per User; `@@unique([cartId, productId, variantId])` so re-adding the same line increases quantity instead of duplicating.
- **Wishlist** / **WishlistItem** — one Wishlist per User; same duplicate-prevention pattern.

`docs/Database.md` was updated to match exactly (added Subcategory/Brand table specs, updated Product, renumbered every section).

The database was seeded (`npx prisma db seed`, `prisma/seed.ts`) with 6 categories, 8 subcategories, 4 brands, and 12 products (2 with multiple size/color variants) so the storefront isn't empty — this is real, persisted data, not client-side placeholder data.

---

## Files Created

### Prisma / Database
- `prisma/schema.prisma` (extended), `prisma/migrations/20260704200542_add_catalog_cart_wishlist/`, `prisma/seed.ts`

### Validation (Zod)
- `features/categories/validation/{category,subCategory,brand}.schema.ts`
- `features/products/validation/{product,productQuery}.schema.ts`
- `features/cart/validation/cart.schema.ts`
- `features/wishlist/validation/wishlist.schema.ts`

### Services (Prisma query layer, server-only)
- `features/categories/services/{category,subCategory,brand}.service.ts`
- `features/products/services/product.service.ts` (listing with filter/sort/pagination, detail, related, featured/new/bestsellers, full admin CRUD, image/variant CRUD)
- `features/cart/services/cart.service.ts` (get-or-create cart, add/update/remove/clear, merge, totals)
- `features/wishlist/services/wishlist.service.ts`

### API Routes
- Admin: `app/api/admin/{categories,subcategories,brands}/route.ts` + `[id]/route.ts`; `app/api/admin/products/route.ts` + `[id]/route.ts` + `[id]/images/route.ts` + `[id]/images/[imageId]/route.ts` + `[id]/variants/route.ts` + `[id]/variants/[variantId]/route.ts` — all Admin-only (`getCurrentAdmin`, new helper added to `lib/auth.ts`).
- Public: `app/api/products/{route,search,featured,new,bestsellers}/route.ts`, `app/api/products/[slug]/{route,related/route}.ts`, `app/api/categories/{route,[slug]/route}.ts`, `app/api/brands/{route,[slug]/route}.ts`, `app/api/cart/{route,[itemId]/route,merge/route}.ts`, `app/api/wishlist/{route,[productId]/route}.ts`.

### Types
- `types/product.ts`, `types/cart.ts`, `types/wishlist.ts` (aliasing Prisma models, matching the pattern already used for `types/user.ts`)

### State (client)
- `lib/cartStorage.ts` — localStorage read/write for the guest cart
- `lib/store/cartStore.ts`, `lib/store/wishlistStore.ts` — Zustand stores (TechStack.md names Zustand for "complex client-side state" — cart/wishlist need to be read from the Navbar, product cards, and dedicated pages simultaneously, which plain Context would make awkward)
- `providers/CartProvider.tsx`, `providers/WishlistProvider.tsx` — sync the stores with auth state (guest → merge-on-login → server-backed) and host the global `CartDrawer`
- `hooks/useCart.ts`, `hooks/useWishlist.ts`

### Components
- `features/products/utils.ts` — `toProductCardProps`, `getProductBadge`, `getEffectivePrice`, `getDefaultVariant`
- `features/products/components/` — `ProductCardConnected`, `ProductGrid`, `ProductFilters`, `ProductSort`, `ProductsPagination`, `ProductListingResults` (shared server component reused by /products, /search, /categories/[slug], /brands/[slug]), `ProductListingSkeleton`, `ProductGallery`, `ProductPurchasePanel`
- `components/products/BrandCard.tsx`

### Pages
- `app/products/{page,loading}.tsx`, `app/products/[slug]/{page,loading}.tsx`
- `app/categories/{page,loading}.tsx`, `app/categories/[slug]/{page,loading}.tsx`
- `app/brands/{page,loading}.tsx`, `app/brands/[slug]/{page,loading}.tsx`
- `app/search/{page,loading}.tsx`
- `app/cart/page.tsx`, `app/wishlist/page.tsx`

## Files Modified

- `lib/auth.ts` — added `getCurrentAdmin()`, a non-redirecting Admin check for Route Handlers (the existing `requireAdmin()` calls `redirect()`, which only works from Server Components).
- `app/layout.tsx` — now `async`; fetches real categories server-side and passes them to `Navbar` (previously hardcoded placeholder categories — removing this was required by the "Do NOT leave placeholders" instruction now that real categories exist).
- `components/navigation/Navbar.tsx` — accepts a `categories` prop instead of importing placeholder data; search bar now navigates to `/search?q=...`; cart icon now opens the real cart drawer with a live item-count badge instead of just linking to `/cart`.
- `providers/Providers.tsx` — added `CartProvider` and `WishlistProvider` to the root tree.
- `constants/routes.ts` — added `brands`/`brand()` route helpers.
- `package.json` — added dependencies `zustand` (cart/wishlist state) and `tsx` (dev-only, runs `prisma/seed.ts`), plus `"prisma": { "seed": "tsx prisma/seed.ts" }`.

No Authentication logic, routes, or middleware were changed.

---

## Features Implemented

**Admin (all RBAC-protected, Admin only):** full CRUD for Category, Subcategory, Brand, Product, Product Images, Product Variants, with Zod validation and consistent JSON error responses (422 validation, 403 forbidden, 404 not found, 409 conflict).

**Customer:** product listing with category/brand/price filters, 5-way sort, pagination; product detail page with an image gallery, size/color variant selection, live stock/price per variant, quantity stepper; category and brand listing + detail pages; search; responsive grid layouts; loading skeletons; empty states; a live cart drawer + full cart page; a wishlist page.

**Product data:** multiple images, sale price vs. original price with computed discount %, stock, SKU, brand, category, subcategory, size/color variants, featured products, new arrivals (derived from `createdAt`), best sellers (Admin-curated flag, since there's no Orders data yet to compute it from sales).

**Cart:** guest cart in `localStorage`, logged-in cart in Postgres, add/remove/update quantity, automatic merge into the server cart on login, live subtotal/item-count.

**Wishlist:** add/remove/view, backed by the database, requires login (no guest wishlist, matching `docs/Database.md`).

---

## Decisions Made

1. **SubCategory and Brand as their own Prisma models**, not a self-referential `parentId` on Category (which `docs/Database.md` previously used for hierarchy). The brief explicitly listed `SubCategory` and `Brand` as separate models to create; `docs/Database.md` was updated to match, and Category's old `parentId` field was not carried over (avoids two competing hierarchy mechanisms).
2. **Prices are whole-rupee integers**, not `Decimal`. Matches the existing frontend (`utils/formatCurrency.ts` formats with `maximumFractionDigits: 0`, and all placeholder product data before this phase was whole numbers). Using `Decimal` would have required `Decimal.js` handling and JSON-serialization workarounds throughout the API layer for no benefit this project needs.
3. **"Best Sellers" is an Admin-curated flag (`isBestSeller`), not sales-derived.** There is no Orders/OrderItems table yet (a later phase), so there's no sales data to rank by. "New Arrivals" needed no new field — it's just `products` sorted by `createdAt`.
4. **Zustand for cart/wishlist state**, per `docs/TechStack.md`'s explicit allowance ("Zustand for complex client-side state, if required"). Both need to be read reactively from the Navbar (badge counts), product cards (wishlist heart state), and dedicated pages at once — React Context would work but Zustand avoids the provider re-render fan-out for this specific cross-cutting state.
5. **Guest cart lines are denormalized in `localStorage`** (they carry their own name/image/price snapshot), not just IDs. This avoids needing a "fetch products by id list" endpoint just to render an unauthenticated cart, at the acceptable cost of the guest view showing a price snapshot from when the item was added (already true of the DB-backed cart too — `CartItem.price` is a snapshot, not a live join).
6. **Route Handlers use a new `getCurrentAdmin()` helper, not the existing `requireAdmin()`.** `requireAdmin()` calls Next's `redirect()`, which throws in a way that's only meaningful from Server Components/Server Actions — using it inside a Route Handler would not produce a clean JSON error response. `getCurrentAdmin()` returns `null` instead, so every admin route can `return apiError(...)` consistently with the rest of the API.
7. **Admin Product update has no separate "inventory" or "feature" sub-endpoints.** `docs/API.md` previously specified them from an earlier draft; the general `PUT /api/admin/products/{id}` already validates and updates `stock`, `isFeatured`, and `isBestSeller` alongside every other field, so a split endpoint would just be two thin wrappers around the same service call. `docs/API.md` was updated to reflect this.
8. **Related Products is `/api/products/{slug}/related`, not `/api/products/{id}/related`** as an earlier API.md draft specified — kept consistent with every other product lookup in this phase, which is by slug (matching the `/products/{slug}` page route), not id.
9. **No admin dashboard UI (tables/forms) was built for catalog management.** The brief's "Admin Features" section explicitly scoped this phase to "Build CRUD APIs" — the APIs are complete, tested, and RBAC-protected, but there is no `/admin/products` management screen yet. This mirrors the same scope discipline used in the Authentication phase (Admin dashboard was a "Coming soon" shell, not a full UI, since it wasn't explicitly requested).
10. **Checkout button on the cart page is disabled ("Coming Soon")** rather than linking to a `/checkout` page that doesn't exist — Checkout/Orders are out of this phase's explicit model list and building a dead link would violate "Do NOT leave placeholders."

---

## Test Report

All testing was done against the live Supabase/Postgres project using disposable accounts and catalog rows, deleted afterward (verified: seed data intact at 6 categories / 8 subcategories / 4 brands / 12 products; only the one pre-existing real user account remains).

**Product/Category/Brand CRUD (Admin)** ✅
- Create/Read/Update/Delete verified for Category, Subcategory, Brand, Product, Product Image, Product Variant.
- Duplicate slug → `409`. Invalid input (empty name) → `422` with field-level messages.
- Deleting a Category/Subcategory/Brand that still has products → `409` (blocked, not a raw DB constraint error).
- Non-admin (logged-in Customer) attempting any admin write → `403`. Unauthenticated → `403`.

**Product Listing** ✅
- `GET /api/products` → all 12 seeded products, correct pagination shape.
- `?category=apparel` → correctly filtered to 2 products.
- `?sort=price-asc` → correctly ascending by price.
- `?page=2&pageSize=5` → correct second page.

**Search** ✅ — `GET /api/products/search?q=silk` → exactly the matching product.

**Filtering & Sorting** ✅ — see above; also verified via the rendered `/products` page (200, no console/server errors) with the filter sidebar and sort dropdown present.

**Pagination** ✅ — verified via API; UI component (`ProductsPagination`) reuses the existing `Pagination` component and updates the `page` query param.

**Product Detail** ✅ — `GET /api/products/silk-wrap-blouse` returns correct `hasVariants`, all 4 variants (including the correct `isDefault`), and 3 images. Related products correctly scoped to the same category, excluding itself.

**Cart** ✅
- Add → creates a cart + item, correct `price`/`itemCount`/`subtotal`.
- Adding the same product again → merges into the existing line (`quantity` increased), confirmed **no duplicate row** is created.
- Update quantity, get cart, remove item — all correct.
- `POST /api/cart/merge` — correctly folds guest-style line items into the server cart.

**Wishlist** ✅
- Unauthenticated add → `401`.
- Add → creates wishlist + item. Adding the same product again → **no duplicate**, still 1 item.
- Get, remove — correct.

**Database Persistence** ✅ — all of the above was verified by direct Prisma queries in addition to API responses, not just trusting the API's own claims.

**API Responses** ✅ — every route follows the `{ success, message, data }` / `{ success, message, errors }` envelope; correct HTTP status codes throughout (200/201/401/403/404/409/422).

**Build** ✅ — `npm run build`: compiled successfully, 0 TypeScript errors, 47 routes generated.

**Lint** ✅ — `npm run lint`: 0 errors, 0 warnings.

**Dev server** ✅ — `npm run dev`: every new page (`/products`, `/products/[slug]`, `/categories`, `/categories/[slug]`, `/brands`, `/brands/[slug]`, `/search`, `/cart`, `/wishlist`) returns `200` with no server-side errors in the log.

---

## Remaining Issues / Known Limitations

- **No Admin management UI** for the catalog (product/category/brand tables, create/edit forms) — only the APIs, per the brief's explicit scope (see Decision 9). Testing was done via direct API calls, documented above.
- **No image upload** — Cloudinary is still not wired up (deferred since Phase 3). Admin image management is URL-based (`imageUrl` field), consistent with that earlier decision.
- **Checkout/Orders do not exist yet** — the cart's Checkout button is intentionally disabled rather than linking to a page that isn't built.
- **Reviews are not implemented** — `averageRating`/`reviewCount` exist on Product and are seeded, but there's no Review model/API yet; ratings are static until that phase.
- **Size/color are not exposed as UI filters** on the listing page, though the API supports `size`/`color` query params — Category/Brand/Price filters were prioritized as the most commonly expected facets; adding a dynamic size/color facet UI is straightforward future work.
- **Price sorting orders by the base `price` field**, not the computed effective price (`salePrice ?? price`). True effective-price sorting at the database level would need a raw SQL expression or a generated column; deferred as a minor, documented limitation.
- **`docs/FolderStructure.md`'s `lib/` folder listing** doesn't mention `lib/store/` or `lib/cartStorage.ts` — these are new, necessary additions for cart/wishlist client state and weren't contradicted by the doc, just not previously listed.

---

## Manual Testing Checklist

For a human reviewer to click through in a browser (everything below was verified via API/direct DB access, but not through actual browser interaction):

- [ ] Browse `/products`, apply a category filter, a brand filter, and a price range, and confirm the grid updates correctly.
- [ ] Change the sort dropdown and confirm the order updates.
- [ ] Paginate to page 2 and back.
- [ ] Search for a product from the Navbar search bar and confirm it lands on `/search?q=...` with correct results.
- [ ] Open a product with variants (e.g. "Silk Wrap Blouse"), change size/color, and confirm price/stock update.
- [ ] Add a product to the cart while signed out, confirm it persists across a page refresh (localStorage), then log in and confirm the item appears in the server-backed cart afterward (merge).
- [ ] Add/remove items from the cart drawer (Navbar cart icon) and the full `/cart` page; confirm quantities and subtotal stay in sync between the two.
- [ ] Add/remove a product from the wishlist while logged in; confirm the heart icon state persists across a refresh; confirm "Move to Cart" works from `/wishlist`.
- [ ] Try adding to the wishlist while signed out and confirm a friendly prompt to log in appears instead of a silent failure.
- [ ] As an Admin, create/edit/delete a category, subcategory, brand, and product via direct API calls (e.g. Postman) and confirm changes reflect on the storefront.

Stopping here — Phase 4 (Core E-Commerce Foundation) is complete and verified. Awaiting review before starting the next phase.
