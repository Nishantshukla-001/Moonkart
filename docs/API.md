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

Get Category

GET

```
/api/categories/{slug}
```

---

# 6. Product APIs

Get Products

GET

```
/api/products
```

Get Product

GET

```
/api/products/{slug}
```

Search Products

GET

```
/api/products/search
```

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
/api/products/{id}/related
```

---

# 7. Cart APIs

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

---

# 8. Wishlist APIs

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

# 9. Checkout APIs

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

# 10. Order APIs

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

# 11. Review APIs

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

# 12. Admin APIs

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

# 13. Admin Product APIs

The Admin manages the entire product catalog directly — there is no seller-scoped product API.

Get Products

GET

```
/api/admin/products
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

Delete Product

DELETE

```
/api/admin/products/{id}
```

Manage Inventory

PUT

```
/api/admin/products/{id}/inventory
```

Feature Product

PUT

```
/api/admin/products/{id}/feature
```

---

# 14. Admin Order APIs

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

# 15. Admin Coupon APIs

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

# 16. Payment APIs

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

# 17. Notification APIs

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

# 18. Contact APIs

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

# 19. API Standards

* Use RESTful naming conventions.
* Return appropriate HTTP status codes.
* Validate all incoming data.
* Protect authenticated routes.
* Apply role-based authorization.
* Paginate large datasets.
* Support filtering, sorting, and searching where appropriate.
* Log important errors for debugging.
* Never expose sensitive information in responses.
