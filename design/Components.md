# MoonKart Component Design System

## Purpose

This document defines every reusable UI component used throughout MoonKart.

Every component should follow the MoonKart Design System and maintain a consistent appearance, spacing, typography, colors, and behavior.

Components must be reusable, responsive, accessible, and production-ready.

---

# Component Foundation

MoonKart's components are built on top of shadcn/ui primitives. Every shadcn/ui component must be customized with Tailwind CSS to match the colors, typography, radii, shadows, and animations defined in this document. Default shadcn/ui styling should never be used unmodified.

---

# Design Philosophy

All components should feel:

- Premium
- Elegant
- Soft
- Feminine
- Modern
- Clean
- Minimal

Components should have:

- Rounded corners
- Soft shadows
- Smooth hover animations
- Plenty of whitespace
- Consistent spacing
- Premium appearance

---

# Border Radius

Buttons

12px

Cards

20px

Inputs

12px

Dropdowns

12px

Modals

24px

Images

20px

Product Cards

24px

Category Cards

24px

---

# Shadows

Cards

Very Soft

Buttons

Soft

Dropdowns

Soft

Navigation

Minimal

Modals

Medium

Avoid heavy shadows.

---

# Animation

Hover Duration

0.25s

Page Transition

0.4s

Button Hover

Scale slightly

Card Hover

Lift slightly

Modal

Fade + Scale

Dropdown

Fade + Slide

Animations should always feel smooth.

---

# Navbar

Contains

- Logo
- Search
- Categories
- Wishlist
- Cart
- Login
- User Menu

Desktop

Sticky

Mobile

Responsive Menu

Background

White

Shadow

Very Light

---

# Hero Section

Large premium banner

Large heading

Subheading

Call To Action

Featured Image

Pastel background

Rounded corners

Responsive layout

---

# Buttons

Primary Button

Soft Sage Green

Rounded

Medium shadow

Hover

Slight lift

Secondary Button

White

Green Border

Hover

Light Green Background

Accent Button

Blush Pink

Hover

Slightly darker pink

Danger Button

Soft Red

Success Button

Soft Green

---

# Product Card

Contains

- Product Image
- Product Name
- Category
- Rating
- Price
- Old Price
- Discount
- Variant Swatches (optional preview)
- Wishlist Button
- Add To Cart Button

Card

Rounded

Soft Shadow

Hover

Lift Animation

Image

Rounded

Buttons

Rounded

---

# Variant Selector

Used on Product Details Page, and optionally as a preview on Product Card.

Contains

- Size Options
- Color Swatches
- Selected State Highlight
- Out Of Stock State

Style

Rounded

Soft Border

Selected

Sage Green Border + Soft Background

Disabled

Muted, Not Clickable

Responsive

---

# Category Card

Contains

- Category Image
- Category Name

Hover

Scale

Shadow

Rounded

---

# Search Bar

Rounded

Search Icon

Clear Button

Auto Suggestions

Recent Searches

Responsive

---

# Input Fields

Rounded

Soft Border

Focus

Green Border

Smooth Animation

Validation

Error Message

---

# Dropdown

Rounded

Soft Shadow

Animated

Scrollable

Responsive

---

# Modal

Rounded

Blur Background

Smooth Animation

Close Button

Responsive

---

# Sidebar

Rounded Sections

Icons

Labels

Active Highlight

Smooth Hover

Responsive

---

# Dashboard Cards

Rounded

White

Soft Shadow

Large Numbers

Small Icons

Chart Support

Responsive

---

# Tables

Rounded

Striped Rows

Hover Effect

Pagination

Search

Sorting

Filtering

Responsive

---

# Pagination

Rounded Buttons

Current Page Highlight

Previous

Next

Responsive

---

# Breadcrumb

Simple

Minimal

Chevron Icons

Responsive

---

# Wishlist Button

Heart Icon

Filled when active

Hover Animation

Smooth Color Change

---

# Cart Drawer

Slide From Right

Rounded

Soft Shadow

Scrollable

Order Summary

Checkout Button

---

# Notification Toast

Rounded

Minimal

Top Right

Success

Error

Warning

Info

---

# Empty State

Illustration

Heading

Description

Primary Button

Friendly Message

---

# Loading State

Skeleton Loader

Spinner

Smooth Animation

No layout shift

---

# Footer

Contains

- Logo
- Quick Links
- Categories
- Contact
- Newsletter
- Social Icons
- Copyright

Background

Light Gray

Responsive

---

# Cards

All cards should have

- Rounded corners
- Soft shadows
- Hover animation
- White background
- Comfortable padding

---

# Icons

Use Lucide React

Size

20px

Dashboard

24px

Buttons

18px

Cards

20px

---

# Images

Rounded

Optimized

Lazy Loaded

Responsive

Maintain Aspect Ratio

---

# Component Rules

Every component must

- Be reusable
- Use TypeScript
- Be responsive
- Be accessible
- Support dark mode in future
- Avoid duplicated code
- Follow MoonKart color system
- Follow MoonKart typography
- Use Tailwind CSS
- Be production ready

---

# Accessibility

Every component should

- Support keyboard navigation
- Have visible focus states
- Include ARIA labels where needed
- Have sufficient color contrast
- Be screen reader friendly

---

# Final Design Philosophy

Every component should feel as if it belongs to the same premium boutique.

The entire website should appear elegant, calm, modern, and luxurious with a consistent visual language.

Users should immediately recognize the MoonKart design style across every page.