# MoonKart Database Specification

# 1. Overview

This document defines the complete database structure for MoonKart.

Database Engine: PostgreSQL

ORM: Prisma

MoonKart is a single-vendor store. The Admin is the sole business owner and seller — there is no seller table, seller role, or seller approval workflow. Products belong directly to the store, not to individual sellers.

Every table must use UUID as the primary key unless otherwise specified.

All tables should include:

* id
* createdAt
* updatedAt

Soft delete should be used where appropriate.

Supabase Auth is the only authentication provider for MoonKart. It exclusively owns user credentials (including passwords and Google OAuth identities). No table in this database may store a password, and application tables must never duplicate credential data managed by Supabase Auth.

---

# 2. User Table

Table Name: users

Purpose:
Store customer and admin profile data. Credentials are never stored here — this table links to the corresponding Supabase Auth identity.

Columns:

* id
* supabaseId
* firstName
* lastName
* email
* phone
* avatar
* role
* authProvider
* isVerified
* isActive
* lastLogin
* createdAt
* updatedAt

Role Values:

* CUSTOMER
* ADMIN

Auth Provider Values:

* EMAIL
* GOOGLE

Notes:

* `supabaseId` is a unique reference to the corresponding user in Supabase Auth (`auth.users.id`) and is the source of truth for identity.
* `password` must never exist as a column on this table. Password hashing, storage, and validation are handled exclusively by Supabase Auth.
* `email` is kept in sync with Supabase Auth for querying and display purposes but is not used for authentication directly.

Relationship:

One User can have many Orders.

One User can have one Cart.

One User can have many Addresses.

One User can have many Reviews.

One User can have one Wishlist.

---

# 3. Category Table

Table Name: categories

Columns

* id
* name
* slug
* image
* description
* isActive
* createdAt
* updatedAt

Relationship

One Category contains many Subcategories.

One Category contains many Products.

---

# 4. Subcategory Table

Table Name: sub_categories

Purpose:

A second, explicit taxonomy level under Category (e.g. Category "Apparel" → Subcategories "Dresses", "Tops"). Introduced in Phase 4 as its own table rather than a self-referential `parentId` on Category, so the two levels stay unambiguous.

Columns

* id
* categoryId
* name
* slug
* image
* description
* isActive
* createdAt
* updatedAt

Relationship

Belongs to one Category.

Has many Products.

---

# 5. Brand Table

Table Name: brands

Columns

* id
* name
* slug
* logo
* description
* isActive
* createdAt
* updatedAt

Relationship

Has many Products.

---

# 6. Product Table

Table Name: products

Columns

* id
* categoryId
* subCategoryId
* brandId
* name
* slug
* shortDescription
* description
* sku
* price
* salePrice
* stock
* weight
* dimensions
* thumbnail
* averageRating
* reviewCount
* isFeatured
* isBestSeller
* isPublished
* hasVariants
* createdAt
* updatedAt

Notes:

* `price`, `salePrice`, and `stock` represent the base/default values for a product without variants, or the display fallback for a product with variants. Both are stored as whole-rupee integers (no paise), matching the rest of the application.
* `hasVariants` indicates whether purchasing must go through Product Variants rather than the base product fields.
* `brandId` and `subCategoryId` are optional — a product always belongs to a Category, but a Brand or Subcategory is not mandatory.
* `isBestSeller` is an Admin-curated flag (like `isFeatured`), since there is no Orders/sales data yet to compute best-sellers automatically. "New Arrivals" is not a stored flag — it is derived by sorting on `createdAt`.
* Products belong directly to the store (managed by Admin). There is no `sellerId` — MoonKart is single-vendor.

Relationship

Belongs to one Category.

Belongs to one Subcategory (optional).

Belongs to one Brand (optional).

Has many Images.

Has many Variants.

Has many Reviews.

Has many Order Items.

---

# 7. Product Variants Table

Table Name: product_variants

Purpose:

Store purchasable size, color, and other variations of a product. Required for fashion and lifestyle items where price and stock are tracked per size/color combination rather than per product.

Columns

* id
* productId
* size
* color
* sku
* price
* salePrice
* stock
* image
* isDefault
* createdAt
* updatedAt

Relationship

Many Variants belong to one Product.

Cart Items and Wishlist Items may each reference a specific Variant in addition to the Product. (Order Items will too, once Orders are implemented.)

---

# 8. Product Images Table

Table Name: product_images

Columns

* id
* productId
* imageUrl
* displayOrder
* createdAt

Relationship

Many Images belong to one Product.

---

# 9. Cart Table

Table Name: carts

Columns

* id
* userId
* createdAt
* updatedAt

Relationship

One Cart belongs to one User, created on first use.

Contains many Cart Items.

Notes:

* A **guest** (signed-out) cart lives entirely in the browser (`localStorage`) and never touches this table. It is merged into a real `Cart` row the moment the shopper logs in.

---

# 10. Cart Items Table

Table Name: cart_items

Columns

* id
* cartId
* productId
* variantId
* quantity
* price
* createdAt

Notes:

* `price` is a snapshot of the unit price at the time the item was added (the product's or variant's sale price, falling back to its regular price).
* Unique on (`cartId`, `productId`, `variantId`) — adding the same product/variant again increases `quantity` instead of creating a second row.

---

# 11. Wishlist Table

Table Name: wishlists

Columns

* id
* userId
* createdAt

Notes:

* Unlike Cart, Wishlist has no guest mode — it requires an authenticated account.

---

# 12. Wishlist Items Table

Table Name: wishlist_items

Columns

* id
* wishlistId
* productId
* variantId

Notes:

* Unique on (`wishlistId`, `productId`, `variantId`) — adding the same product again is a no-op, not a duplicate.

---

# 13. Address Table

Columns

* id
* userId
* fullName
* phone
* addressLine1
* addressLine2
* city
* state
* country
* postalCode
* isDefault

---

# 14. Orders Table

Table Name: orders

Columns

* id
* userId
* orderNumber
* orderStatus
* paymentStatus
* paymentMethod
* subtotal
* discount
* shippingCharge
* tax
* totalAmount
* shippingAddressId
* createdAt
* updatedAt

Order Status

* Pending
* Confirmed
* Packed
* Shipped
* Delivered
* Cancelled
* Returned

---

# 15. Order Items Table

Columns

* id
* orderId
* productId
* variantId
* quantity
* unitPrice
* totalPrice

---

# 16. Payments Table

Columns

* id
* orderId
* razorpayPaymentId
* transactionId
* paymentMethod
* paymentStatus
* amount
* paidAt

---

# 17. Reviews Table

Columns

* id
* userId
* productId
* rating
* title
* comment
* createdAt

---

# 18. Coupons Table

Columns

* id
* code
* description
* discountType
* discountValue
* minimumPurchase
* maximumDiscount
* expiryDate
* usageLimit
* isActive

---

# 19. Notifications Table

Columns

* id
* userId
* title
* message
* type
* isRead
* createdAt

---

# 20. Banner Table

Columns

* id
* title
* image
* link
* startDate
* endDate
* isActive

---

# 21. Contact Messages Table

Columns

* id
* name
* email
* subject
* message
* replied
* createdAt

---

# 22. Newsletter Table

Columns

* id
* email
* subscribedAt

---

# 23. Audit Logs Table

Purpose

Track important admin actions.

Columns

* id
* adminId
* action
* entity
* entityId
* ipAddress
* createdAt

---

# 24. Relationships Summary

User

↓

Cart

↓

Cart Items

↓

Products

↓

Product Variants

↓

Subcategory

↓

Category

↓

Brand

↓

Orders

↓

Payments

↓

Reviews

---

# 25. Indexes

Create indexes for:

* email
* slug
* categoryId
* subCategoryId
* brandId
* userId
* productId
* orderNumber
* paymentStatus
* orderStatus
* supabaseId
* isFeatured
* isBestSeller
* isPublished

---

# 26. General Rules

* Use UUIDs for primary keys.
* Enforce foreign key constraints.
* Use timestamps consistently.
* Validate unique email addresses.
* Never store passwords in the application database — Supabase Auth is the exclusive credential store.
* Never store payment card details.
* Use transactions for checkout and payment operations.
