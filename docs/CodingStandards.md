# MoonKart Coding Standards

## Purpose

This document defines the coding standards for the MoonKart project.

Every file, function, component, and API should follow these rules.

The objective is to maintain a clean, scalable, readable, and production-ready codebase.

---

# General Principles

Always write code that is:

- Clean
- Readable
- Modular
- Reusable
- Maintainable
- Secure
- Scalable
- Well Organized

Code should be understandable without unnecessary comments.

---

# Programming Language

Use

- TypeScript only

Never use

- JavaScript
- any type unless absolutely unavoidable

Prefer strict typing everywhere.

---

# Framework

Use

- Next.js 15 App Router

Do not use the Pages Router.

---

# Styling

Use

- Tailwind CSS

Do not use

- Inline CSS
- CSS Modules unless specifically required

---

# Components

Every component should

- Have one responsibility
- Be reusable
- Accept typed props
- Be responsive
- Be accessible

Build components on top of shadcn/ui primitives, customized with Tailwind CSS to match the colors, typography, radii, and shadows defined in design/Components.md. Never use shadcn/ui defaults unstyled.

Avoid giant components.

Split large components into smaller reusable components.

---

# Naming Convention

React Components

PascalCase

Examples

ProductCard.tsx

Navbar.tsx

CheckoutForm.tsx

---

Hooks

camelCase

Examples

useCart.ts

useAuth.ts

useProducts.ts

---

Utilities

camelCase

Examples

formatCurrency.ts

generateSlug.ts

calculateDiscount.ts

---

Constants

UPPER_CASE

Example

MAX_PRODUCTS

DEFAULT_PAGE_SIZE

---

Variables

camelCase

Example

productPrice

userProfile

totalOrders

---

Types

PascalCase

Example

Product

Order

Seller

Customer

---

Interfaces

Prefix with I

Example

IProduct

IOrder

ISeller

---

Enums

PascalCase

Example

OrderStatus

UserRole

PaymentStatus

---

# Function Rules

Every function should

- Have one responsibility
- Be short
- Return predictable results
- Handle errors properly

Avoid extremely long functions.

---

# API Rules

Every endpoint must

- Validate input
- Return proper status codes
- Handle errors
- Use Zod validation
- Return consistent JSON

---

# Database Rules

Always

- Use Prisma
- Use UUIDs
- Use foreign keys
- Normalize data

Never duplicate information unnecessarily.

---

# Error Handling

Always

- Catch errors
- Return meaningful messages
- Log unexpected errors

Never expose internal server details.

---

# Comments

Only write comments when necessary.

Good code should explain itself.

Avoid unnecessary comments.

---

# Imports

Always use path aliases.

Example

@/components

@/features

@/lib

@/hooks

Avoid deep relative imports.

---

# File Size

Components

Prefer under 300 lines.

Functions

Prefer under 40 lines.

Split large files when needed.

---

# Performance

Always

- Optimize images
- Lazy load heavy components
- Avoid unnecessary re-renders
- Use memoization only when beneficial
- Keep bundle size small

---

# Security

Always

- Validate user input
- Sanitize data
- Protect API routes
- Use environment variables
- Never expose secrets
- Prevent SQL Injection
- Prevent XSS
- Prevent CSRF

---

# Git Commit Style

Use meaningful commit messages.

Examples

feat: add product search

feat: create seller dashboard

fix: resolve checkout issue

refactor: optimize product service

docs: update API documentation

style: improve button spacing

---

# Testing

Before completing any feature

- Build successfully
- No TypeScript errors
- No ESLint errors
- No console errors
- Responsive on mobile
- Responsive on tablet
- Responsive on desktop

---

# Accessibility

Every page should

- Support keyboard navigation
- Include proper labels
- Meet WCAG AA standards
- Use semantic HTML

---

# Code Review Checklist

Before considering any feature complete, verify:

- Clean code
- No duplicated logic
- Proper naming
- Responsive layout
- Accessible UI
- Error handling
- Loading states
- Empty states
- Type safety
- Secure implementation

---

# Development Philosophy

Quality is more important than speed.

Always prioritize:

- Maintainability
- Simplicity
- Performance
- Scalability
- Security
- User Experience

Every piece of code should be production-ready and suitable for a real-world application.

Claude should never sacrifice code quality for faster implementation.