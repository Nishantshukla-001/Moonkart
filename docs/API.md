# MoonKart API Specification

# 1. Overview

This document defines the REST API structure for MoonKart.

MoonKart is a single-vendor store — there is no Seller role or seller-scoped API namespace. The Admin manages the entire product catalog, orders, and coupons directly under `/api/admin/*`.

## Base URL

```
/api
```

## Response Format

Every API should return a consistent JSON response.

### Success

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "message": "Error description",
  "errors": []
}
```

---

# 2. Authentication APIs

## Register

POST

```
/api/auth/register
```

Purpose

* Create a new customer account.

---

## Login

POST

```
/api/auth/login
```

Purpose

* Authenticate user.

---

## Logout

POST

```
/api/auth/logout
```

---

## Forgot Password

POST

```
/api/auth/forgot-password
```

---

## Reset Password

POST

```
/api/auth/reset-password
```

---

## Verify Email

POST

```
/api/auth/verify-email
```

---

## Current User

GET

```
/api/auth/me
```

Returns the authenticated user.

---

## Google OAuth Login

Handled directly by the Supabase Auth client SDK (`signInWithOAuth`) on the frontend. No custom `/api/auth/google` route is required.

Purpose

* Authenticate or register a user using their Google account.

After Supabase redirects back to the application, the user profile is created or synced in the database using the same logic as `/api/auth/register`.

---

# 3. Customer APIs

## Profile

GET

```
/api/profile
```

Update Profile

PUT

```
/api/profile
```

Change Password

PUT

```
/api/profile/password
```

Delete Account

DELETE

```
/api/profile
```

---

# 4. Address APIs

Get Addresses

GET

```
/api/addresses
```

Create Address

POST

```
/api/addresses
```

Update Address

PUT

```
/api/addresses/{id}
```

Delete Address

DELETE

```
/api/addresses/{id}
```

---

# 5. Category APIs

Get Categories

GET

```
/api/categories
```

Returns only active categories, each with its active subcategories nested.

Get Category

GET

```
/api/categories/{slug}
```

Returns a category with its active subcategories nested.

---

# 6. Brand APIs

Get Brands

GET

```
/api/brands
```

Get Brand

GET

```
/api/brands/{slug}
```

---

# 7. Product APIs

Get Products

GET

```
/api/products
```

Query parameters (all optional): `page`, `pageSize` (max 48), `category` (slug), `subCategory` (slug), `brand` (slug), `search`, `minPrice`, `maxPrice`, `size`, `color`, `sort` (`newest` | `price-asc` | `price-desc` | `rating` | `name`).

Get Product

GET

```
/api/products/{slug}
```

Search Products

GET

```
/api/products/search?q={query}
```

Accepts the same filter/sort/pagination parameters as `GET /api/products`, in addition to `q`.

Featured Products

GET

```
/api/products/featured
```

New Arrivals

GET

```
/api/products/new
```

Best Sellers

GET

```
/api/products/bestsellers
```

Related Products

GET

```
/api/products/{slug}/related
```

Products are looked up by slug throughout (not id), for consistency with the `/products/{slug}` page route.

---

# 8. Cart APIs

A signed-out (guest) cart lives entirely in the browser (`localStorage`) and never calls these endpoints — they exist only for an authenticated cart.

Get Cart

GET

```
/api/cart
```

Add Item

POST

```
/api/cart
```

Body: `{ productId, variantId?, quantity }`. Adding a product/variant already in the cart increases its quantity instead of creating a duplicate line.

Update Quantity

PUT

```
/api/cart/{itemId}
```

Remove Item

DELETE

```
/api/cart/{itemId}
```

Clear Cart

DELETE

```
/api/cart
```

Merge Guest Cart

POST

```
/api/cart/merge
```

Body: `{ items: [{ productId, variantId?, quantity }] }`. Called once, right after login, to fold the guest (`localStorage`) cart into the user's server-side cart.

---

# 9. Wishlist APIs

Wishlist requires an authenticated account — there is no guest wishlist.

Get Wishlist

GET

```
/api/wishlist
```

Add Product

POST

```
/api/wishlist
```

Remove Product

DELETE

```
/api/wishlist/{productId}
```

---

# 10. Checkout APIs

Create Checkout

POST

```
/api/checkout
```

Apply Coupon

POST

```
/api/checkout/coupon
```

Place Order

POST

```
/api/orders
```

---

# 11. Order APIs

Get Orders

GET

```
/api/orders
```

Get Order Details

GET

```
/api/orders/{id}
```

Cancel Order

PUT

```
/api/orders/{id}/cancel
```

Return Order

PUT

```
/api/orders/{id}/return
```

Download Invoice

GET

```
/api/orders/{id}/invoice
```

---

# 12. Review APIs

Get Reviews

GET

```
/api/products/{id}/reviews
```

Add Review

POST

```
/api/products/{id}/reviews
```

Edit Review

PUT

```
/api/reviews/{id}
```

Delete Review

DELETE

```
/api/reviews/{id}
```

---

# 13. Admin APIs

Dashboard

GET

```
/api/admin/dashboard
```

Users

GET

```
/api/admin/users
```

Update User

PUT

```
/api/admin/users/{id}
```

Delete User

DELETE

```
/api/admin/users/{id}
```

---

# 14. Admin Category APIs

Get Categories

GET

```
/api/admin/categories
```

Includes inactive categories (unlike the public endpoint).

Get Category

GET

```
/api/admin/categories/{id}
```

Create Category

POST

```
/api/admin/categories
```

Update Category

PUT

```
/api/admin/categories/{id}
```

Delete Category

DELETE

```
/api/admin/categories/{id}
```

Rejected with `409` if the category still has products.

---

# 15. Admin Subcategory APIs

Get Subcategories

GET

```
/api/admin/subcategories
```

Optional `?categoryId=` filter.

Create Subcategory

POST

```
/api/admin/subcategories
```

Update Subcategory

PUT

```
/api/admin/subcategories/{id}
```

Delete Subcategory

DELETE

```
/api/admin/subcategories/{id}
```

Rejected with `409` if the subcategory still has products.

---

# 16. Admin Brand APIs

Get Brands

GET

```
/api/admin/brands
```

Includes inactive brands (unlike the public endpoint).

Create Brand

POST

```
/api/admin/brands
```

Update Brand

PUT

```
/api/admin/brands/{id}
```

Delete Brand

DELETE

```
/api/admin/brands/{id}
```

Rejected with `409` if the brand still has products.

---

# 17. Admin Product APIs

The Admin manages the entire product catalog directly — there is no seller-scoped product API.

Get Products

GET

```
/api/admin/products
```

Paginated (`?page=&pageSize=`); includes unpublished products.

Get Product

GET

```
/api/admin/products/{id}
```

Create Product

POST

```
/api/admin/products
```

Update Product

PUT

```
/api/admin/products/{id}
```

Used for every field update, including stock (inventory) and `isFeatured`/`isBestSeller` — there is no separate inventory or feature-toggle endpoint.

Delete Product

DELETE

```
/api/admin/products/{id}
```

---

# 18. Admin Product Image APIs

Add Image

POST

```
/api/admin/products/{id}/images
```

Body: `{ imageUrl, displayOrder? }`.

Delete Image

DELETE

```
/api/admin/products/{id}/images/{imageId}
```

---

# 19. Admin Product Variant APIs

Add Variant

POST

```
/api/admin/products/{id}/variants
```

Body: `{ size?, color?, sku?, price?, salePrice?, stock, image?, isDefault? }`.

Update Variant

PUT

```
/api/admin/products/{id}/variants/{variantId}
```

Delete Variant

DELETE

```
/api/admin/products/{id}/variants/{variantId}
```

---

# 20. Admin Order APIs

Get Orders

GET

```
/api/admin/orders
```

Update Order Status

PUT

```
/api/admin/orders/{id}
```

---

# 21. Admin Coupon APIs

Create Coupon

POST

```
/api/admin/coupons
```

Get Coupons

GET

```
/api/admin/coupons
```

Update Coupon

PUT

```
/api/admin/coupons/{id}
```

Delete Coupon

DELETE

```
/api/admin/coupons/{id}
```

---

# 22. Payment APIs

Create Payment

POST

```
/api/payments/create
```

Verify Payment

POST

```
/api/payments/verify
```

Payment History

GET

```
/api/payments/history
```

Refund Payment

POST

```
/api/payments/refund
```

---

# 23. Notification APIs

Get Notifications

GET

```
/api/notifications
```

Mark as Read

PUT

```
/api/notifications/{id}
```

Delete Notification

DELETE

```
/api/notifications/{id}
```

---

# 24. Contact APIs

Submit Contact Form

POST

```
/api/contact
```

Subscribe Newsletter

POST

```
/api/newsletter
```

---

# 25. API Standards

* Use RESTful naming conventions.
* Return appropriate HTTP status codes.
* Validate all incoming data.
* Protect authenticated routes.
* Apply role-based authorization.
* Paginate large datasets.
* Support filtering, sorting, and searching where appropriate.
* Log important errors for debugging.
* Never expose sensitive information in responses.
