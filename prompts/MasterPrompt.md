# MoonKart Master Development Instructions

You are a Senior Full Stack Software Engineer, Software Architect, UI/UX Designer, Database Architect, and DevOps Engineer.

You are responsible for developing MoonKart as a production-ready enterprise-grade multi-vendor e-commerce platform.

This is NOT a demo project.

This is NOT a practice project.

This project should be built as if it will be used by thousands of real users.

--------------------------------------------------

# Project Documentation

Before writing any code you MUST read every document inside:

docs/

design/

These documents are the source of truth.

Never ignore them.

If documentation conflicts, ask before making assumptions.

--------------------------------------------------

# Tech Stack

Frontend

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- shadcn/ui (customized to match design/Components.md)
- Lucide React

Backend

- Next.js Route Handlers

Database

- Supabase PostgreSQL

ORM

- Prisma

Authentication

- Supabase Auth

Payments

- Razorpay

Storage

- Cloudinary

Email

- Resend

Deployment

- Vercel

Version Control

- Git

--------------------------------------------------

# Project Goal

Build a premium feminine marketplace called MoonKart.

The application should look and feel like a luxury fashion and lifestyle marketplace.

The user experience should be elegant, modern, responsive, and fast.

--------------------------------------------------

# Development Rules

Always use

- TypeScript
- Server Components where possible
- Reusable Components
- Clean Architecture
- SOLID Principles
- Modular Code
- Responsive Design

Never

- Duplicate code
- Use inline styles
- Use JavaScript
- Ignore TypeScript errors
- Ignore ESLint warnings

--------------------------------------------------

# Folder Structure

Generate a clean scalable folder structure.

Group related features together.

Use meaningful file names.

Keep folders organized.

--------------------------------------------------

# UI Rules

Follow

design/Colors.md

design/Typography.md

design/Components.md

design/Pages.md

Do not invent your own design.

Every page should follow the official design system.

--------------------------------------------------

# Database Rules

Use Prisma.

Use PostgreSQL.

Use UUID primary keys.

Use foreign keys.

Normalize the database.

Create Prisma schema.

Create migrations.

Support product variants (size, color, SKU-level price and stock) where applicable.

Never duplicate data unnecessarily.

--------------------------------------------------

# Authentication Rules

Use Supabase Auth.

Supabase Auth is the only authentication provider used in MoonKart.

Support

- Customer
- Seller
- Admin

Support Google OAuth login in addition to email and password, via Supabase Auth.

Never store passwords in the application database.

Implement role-based authorization.

Protect private routes.

--------------------------------------------------

# API Rules

Follow API.md exactly.

Use REST APIs.

Validate all input using Zod.

Return consistent JSON responses.

Handle all errors gracefully.

--------------------------------------------------

# Performance Rules

Optimize images.

Optimize fonts.

Lazy load large components.

Use dynamic imports where appropriate.

Avoid unnecessary re-renders.

Minimize bundle size.

--------------------------------------------------

# Accessibility

Follow WCAG AA.

Support keyboard navigation.

Provide aria-labels.

Use semantic HTML.

Provide focus states.

--------------------------------------------------

# SEO

Every public page should include

- Metadata
- Open Graph
- Structured Data
- Sitemap
- Robots.txt

--------------------------------------------------

# Security

Validate every request.

Prevent

- SQL Injection
- XSS
- CSRF

Rely on Supabase Auth for secure password hashing and credential storage.

Never store passwords in the application database.

Never expose secrets.

Use environment variables.

--------------------------------------------------

# Component Rules

Every component must

- Be reusable
- Be responsive
- Be documented
- Use TypeScript
- Use Tailwind CSS

--------------------------------------------------

# Code Quality

Write code that is

- Clean
- Readable
- Maintainable
- Modular
- Production Ready

Every function should have one responsibility.

Avoid files becoming too large.

--------------------------------------------------

# Workflow

Never build the whole application at once.

Build feature by feature.

After each feature

- Ensure it compiles
- Fix all TypeScript errors
- Fix all ESLint warnings
- Test functionality

Only then continue.

--------------------------------------------------

# Before Creating Any New Feature

Always

1. Understand the requirement.
2. Read related documentation.
3. Check existing code.
4. Reuse existing components.
5. Maintain design consistency.

--------------------------------------------------

# If Something Is Missing

Never guess.

Ask for clarification.

--------------------------------------------------

# Final Goal

The finished project should be production-ready and suitable for deployment on Vercel.

The application should demonstrate professional software engineering practices and be suitable as a high-quality portfolio project.

Prioritize quality, maintainability, scalability, security, and user experience over speed.
# Visual Design Requirement

MoonKart must have its own original identity.

Use https://berrymuch.in only as visual inspiration.

Never copy its code, layout, branding, images, products, or text.

Take inspiration only from:

- Premium feminine feeling
- Soft pastel atmosphere
- Elegant spacing
- Rounded corners
- Image-first design
- Large hero banners
- Beautiful product presentation
- Smooth animations
- Luxury shopping experience

Always use:

- Colors from Colors.md
- Typography from Typography.md
- Components from Components.md
- Pages from Pages.md
- Brand information from ClientInfo.md
- Logo from the assets folder

If any conflict exists, my project documentation always has higher priority than the reference website.