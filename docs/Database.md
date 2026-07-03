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
* parentId
* name
* slug
* image
* description
* isActive
* createdAt
* updatedAt

Relationship

One Category contains many Products.

---

# 4. Product Table

Table Name: products

Columns

* id
* categoryId
* name
* slug
* shortDescription
* description
* sku
* brand
* price
* salePrice
* stock
* weight
* dimensions
* thumbnail
* averageRating
* reviewCount
* isFeatured
* isPublished
* hasVariants
* createdAt
* updatedAt

Notes:

* `price`, `salePrice`, and `stock` represent the base/default values for a product without variants, or the display fallback for a product with variants.
* `hasVariants` indicates whether purchasing must go through Product Variants rather than the base product fields.
* Products belong directly to the store (managed by Admin). There is no `sellerId` — MoonKart is single-vendor.

Relationship

Belongs to one Category.

Has many Images.

Has many Variants.

Has many Reviews.

Has many Order Items.

---

# 5. Product Variants Table

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

Cart Items, Wishlist Items, and Order Items may each reference a specific Variant in addition to the Product.

---

# 6. Product Images Table

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

# 7. Cart Table

Table Name: carts

Columns

* id
* userId
* createdAt
* updatedAt

Relationship

One Cart belongs to one User.

Contains many Cart Items.

---

# 8. Cart Items Table

Table Name: cart_items

Columns

* id
* cartId
* productId
* variantId
* quantity
* price
* createdAt

---

# 9. Wishlist Table

Table Name: wishlists

Columns

* id
* userId
* createdAt

---

# 10. Wishlist Items Table

Columns

* id
* wishlistId
* productId
* variantId

---

# 11. Address Table

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

# 12. Orders Table

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

# 13. Order Items Table

Columns

* id
* orderId
* productId
* variantId
* quantity
* unitPrice
* totalPrice

---

# 14. Payments Table

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

# 15. Reviews Table

Columns

* id
* userId
* productId
* rating
* title
* comment
* createdAt

---

# 16. Coupons Table

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

# 17. Notifications Table

Columns

* id
* userId
* title
* message
* type
* isRead
* createdAt

---

# 18. Banner Table

Columns

* id
* title
* image
* link
* startDate
* endDate
* isActive

---

# 19. Contact Messages Table

Columns

* id
* name
* email
* subject
* message
* replied
* createdAt

---

# 20. Newsletter Table

Columns

* id
* email
* subscribedAt

---

# 21. Audit Logs Table

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

# 22. Relationships Summary

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

Category

↓

Orders

↓

Payments

↓

Reviews

---

# 23. Indexes

Create indexes for:

* email
* slug
* categoryId
* userId
* productId
* orderNumber
* paymentStatus
* orderStatus
* supabaseId

---

# 24. General Rules

* Use UUIDs for primary keys.
* Enforce foreign key constraints.
* Use timestamps consistently.
* Validate unique email addresses.
* Never store passwords in the application database — Supabase Auth is the exclusive credential store.
* Never store payment card details.
* Use transactions for checkout and payment operations.
