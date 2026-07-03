# MoonKart Folder Structure Specification

## Purpose

This document defines the official folder structure for the MoonKart project.

Claude must strictly follow this structure while generating the application.

Do not create unnecessary folders.

Keep the project organized, scalable, and easy to maintain.

MoonKart is a single-vendor store — there is no `seller/` folder anywhere in this structure. The Admin manages the entire catalog directly.

---

# Root Folder

```
MoonKart/
│
├── app/
├── components/
├── features/
├── lib/
├── hooks/
├── services/
├── providers/
├── types/
├── utils/
├── constants/
├── prisma/
├── public/
├── styles/
├── middleware.ts
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── .env.local
└── README.md
```

---

# App Folder

The app folder should use the Next.js App Router.

```
app/
│
├── (public)/
├── auth/
├── account/
├── admin/
├── api/
├── checkout/
├── cart/
├── wishlist/
├── search/
├── products/
├── categories/
├── profile/
├── orders/
├── layout.tsx
├── loading.tsx
├── error.tsx
├── not-found.tsx
└── page.tsx
```

---

# Components Folder

Contains reusable UI components.

```
components/
│
├── ui/
├── layout/
├── navigation/
├── footer/
├── buttons/
├── forms/
├── cards/
├── products/
├── categories/
├── dashboard/
├── tables/
├── charts/
├── modals/
├── dialogs/
├── loaders/
├── notifications/
└── shared/
```

Every component should be reusable.

The `ui/` folder contains shadcn/ui components customized to match the MoonKart design system defined in design/Components.md.

---

# Features Folder

Contains business logic.

```
features/
│
├── auth/
├── cart/
├── wishlist/
├── checkout/
├── orders/
├── products/
├── categories/
├── reviews/
├── admin/
├── notifications/
└── analytics/
```

---

# Lib Folder

Contains application libraries.

```
lib/
│
├── prisma.ts
├── supabase.ts
├── auth.ts
├── cloudinary.ts
├── razorpay.ts
├── validations.ts
├── helpers.ts
└── constants.ts
```

---

# Hooks Folder

Contains custom React hooks.

Examples

- useCart
- useWishlist
- useProducts
- useOrders
- useDebounce
- usePagination
- useTheme

---

# Services Folder

Contains API and business services.

Examples

- auth.service.ts
- product.service.ts
- order.service.ts
- payment.service.ts

---

# Providers Folder

Contains global providers.

Examples

- AuthProvider
- ThemeProvider
- QueryProvider

---

# Types Folder

Contains TypeScript types.

Examples

- product.ts
- order.ts
- user.ts
- review.ts

---

# Utils Folder

Contains reusable helper functions.

Examples

- formatCurrency
- formatDate
- generateSlug
- debounce
- calculateDiscount

---

# Constants Folder

Contains constants.

Examples

- routes.ts
- roles.ts
- colors.ts
- config.ts

---

# Prisma Folder

Contains Prisma schema and migrations.

```
prisma/
│
├── schema.prisma
└── migrations/
```

---

# Public Folder

Contains static assets.

```
public/
│
├── images/
├── icons/
├── logos/
├── fonts/
└── favicon.ico
```

---

# Styles Folder

Contains global styles.

```
styles/
│
├── globals.css
├── variables.css
└── animations.css
```

---

# API Structure

Every API should follow:

```
app/api/

auth/

products/

categories/

orders/

payments/

admin/

notifications/
```

---

# Naming Convention

Folders

lowercase

Examples

products

checkout

admin

---

Files

React Components

PascalCase

Example

ProductCard.tsx

Hooks

camelCase

Example

useCart.ts

Utilities

camelCase

Example

formatCurrency.ts

Types

camelCase

Example

product.ts

---

# Import Rules

Always use path aliases.

Example

```
@/components

@/features

@/hooks

@/lib

@/utils
```

Avoid long relative imports.

---

# Architecture Rules

Separate

- UI
- Business Logic
- Database
- API
- Utilities

Never mix responsibilities.

---

# Code Organization

Every feature should have

- Components
- Types
- Validation
- Services

Each feature should be independent.

---

# Future Scalability

Folder structure should support

- Mobile App
- Internationalization
- Multiple Payment Gateways
- Future Microservices

---

# Final Folder Philosophy

The folder structure should remain clean, modular, scalable, and easy to understand.

Every folder should have a single responsibility.

Developers should be able to quickly locate any file without confusion.