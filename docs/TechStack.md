# MoonKart Technology Stack

# 1. Project Philosophy

The MoonKart project should be built using modern, stable, production-ready technologies.

The codebase should prioritize:

* Scalability
* Performance
* Security
* Maintainability
* Reusability
* Clean Architecture
* Developer Experience

---

# 2. Frontend

Framework

* Next.js 15 (App Router)

Language

* TypeScript

Styling

* Tailwind CSS

Animations

* Framer Motion

Icons

* Lucide React

UI Components

* shadcn/ui, customized to match the MoonKart design system (see design/Components.md)

Fonts

* Google Fonts using next/font

State Management

* React Context API for global state
* Zustand for complex client-side state (if required)

Forms

* React Hook Form

Validation

* Zod

Notifications

* Sonner

Theme Support

* next-themes

---

# 3. Backend

Backend Framework

* Next.js Route Handlers

Language

* TypeScript

Validation

* Zod

Authentication

* Supabase Auth (only authentication provider used)

OAuth Providers

* Google (via Supabase Auth)

Authorization

* Role-Based Access Control (RBAC)

Roles

* Customer
* Seller
* Admin

---

# 4. Database

Database

* PostgreSQL

ORM

* Prisma ORM

Database Naming

* snake_case for database tables and columns

Application Naming

* camelCase

Primary Keys

* UUID

Relationships

* Foreign Keys

Soft Delete

* Use where appropriate

---

# 5. Image Storage

Provider

* Cloudinary

Requirements

* Image optimization
* Automatic compression
* Secure uploads
* Multiple image sizes
* Product gallery support

---

# 6. Payments

Gateway

* Razorpay

Supported Methods

* UPI
* Credit Card
* Debit Card
* Net Banking
* Wallets

Future

* EMI
* International Payments

---

# 7. Email

Provider

* Resend

Emails

* Welcome Email
* Verify Email
* Password Reset
* Order Confirmation
* Seller Approval
* Notifications

---

# 8. File Uploads

Provider

* Cloudinary

Supported Files

* Images
* Product Images
* Store Logos
* User Avatars
* Banner Images

---

# 9. Authentication

Provider

* Supabase Auth (the only authentication provider used across MoonKart)

Features

* Login
* Signup
* Google OAuth Login
* Logout
* Email Verification
* Password Reset
* Session Management

---

# 10. Deployment

Frontend

* Vercel

Database

* PostgreSQL

Image Storage

* Cloudinary

Domain

* Custom Domain

Environment Variables

* Use .env.local

---

# 11. Version Control

Platform

* GitHub

Workflow

* Feature-based commits

Commit Messages

Examples

* feat: add seller dashboard
* fix: resolve checkout bug
* refactor: improve product service
* docs: update API documentation

---

# 12. Folder Naming

Use

* lowercase
* hyphens where appropriate
* meaningful names

Example

components/

seller-dashboard/

product-card/

---

# 13. File Naming

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

---

# 14. Code Style

Always

* Use TypeScript
* Use async/await
* Avoid any
* Prefer reusable components
* Prefer composition over duplication
* Keep functions small
* Write meaningful variable names

---

# 15. Performance Standards

* Server Components by default
* Client Components only when necessary
* Lazy load large components
* Optimize images
* Optimize fonts
* Minimize bundle size
* Cache where appropriate

---

# 16. Security Standards

* Validate all user input
* Sanitize data
* Hash passwords
* Never expose secrets
* Protect API routes
* Use HTTPS
* Implement rate limiting
* Prevent XSS
* Prevent CSRF
* Prevent SQL Injection

---

# 17. Responsive Design

Support

* Mobile
* Tablet
* Laptop
* Desktop

The application should be mobile-first.

---

# 18. Browser Support

Latest versions of

* Chrome
* Edge
* Firefox
* Safari

---

# 19. Accessibility

The application should

* Use semantic HTML
* Support keyboard navigation
* Include proper ARIA labels
* Have sufficient color contrast
* Include alt text for images
* Display visible focus indicators

---

# 20. Coding Rules

Claude should always:

* Use reusable components.
* Keep files organized.
* Avoid duplicated code.
* Write clean TypeScript.
* Follow the documented folder structure.
* Build production-ready features.
* Ask before changing existing architecture.
* Never replace completed features unless requested.
* Keep code modular and easy to maintain.
