# MoonKart Authentication Specification

## Purpose

This document defines the complete authentication and authorization system for MoonKart.

Authentication must be secure, scalable, and production-ready.

MoonKart will use Supabase Authentication for user identity management and Prisma with PostgreSQL for application data.

MoonKart is a single-vendor store. The Admin is the sole business owner and seller — there is no Seller role, seller registration, or seller approval workflow. Customers can only purchase products.

---

# Authentication Provider

Authentication Service

- Supabase Auth

Database

- Supabase PostgreSQL

ORM

- Prisma

Session Type

- Secure JWT Session

Supported Sign-In Methods

- Email and Password
- Google OAuth

Supabase Auth is the only authentication and identity provider used across MoonKart. No other credential system should be introduced.

---

# User Roles

MoonKart supports two user roles.

## Customer

Can

- Register
- Login
- Shop
- Add to Cart
- Wishlist
- Place Orders
- Manage Profile
- Manage Addresses
- Write Reviews

A Customer can never become a Seller — MoonKart has no seller role or seller registration flow.

---

## Admin

The Admin is the business owner and the store's only seller.

Can

- Access Admin Dashboard
- Manage Products
- Manage Categories
- Manage Inventory
- Manage Orders
- Manage Coupons
- Manage Banners
- Manage Customers
- Manage Reviews
- View Analytics
- Manage Website Settings

---

# Authentication Flow

## Customer Registration

Steps

1. User opens Signup page.
2. User enters Name, Email, Phone, Password.
3. Validate input.
4. Create Supabase Auth account.
5. Create user profile in database.
6. Send verification email.
7. Redirect to Email Verification page.

Customers may alternatively register using Google OAuth. When using Google, the email is pre-verified by Google and the verification email step is skipped.

---

## Customer Login

Steps

1. Enter Email
2. Enter Password
3. Validate Credentials
4. Create Secure Session
5. Redirect to Homepage

---

## Google Login

Steps

1. User selects "Continue with Google" on the Login or Signup page.
2. Supabase Auth handles the Google OAuth redirect and consent flow.
3. On successful authorization, Supabase Auth creates or matches the user's identity.
4. Create or update the user profile in the database (role defaults to Customer, authProvider set to GOOGLE).
5. Create Secure Session.
6. Redirect to Homepage.

Google-authenticated accounts are treated as email-verified automatically.

---

## Admin Login

Admins cannot register publicly.

Admin accounts are created manually.

Only authorized administrators can access Admin Dashboard.

---

# Email Verification

After registration

User must verify email.

Until verified

- Login allowed (optional, depending on policy)
- Sensitive actions may be restricted

---

# Password Policy

Minimum Length

8 Characters

Must contain

- Uppercase Letter
- Lowercase Letter
- Number
- Special Character

Weak passwords should not be accepted.

Passwords are validated against this policy before being submitted to Supabase Auth. Supabase Auth is the exclusive store for password credentials — MoonKart's application database never stores passwords.

---

# Forgot Password

Flow

1. Enter Email
2. Receive Reset Link
3. Open Link
4. Enter New Password
5. Login Again

---

# Change Password

Authenticated users can

- Change Password
- Confirm Current Password
- Save New Password

---

# Session Management

Sessions should

- Be secure
- Expire automatically
- Support Remember Me
- Support logout from current device

Future Version

- Logout From All Devices

---

# Protected Routes

Customer Pages

Require Login

Admin Pages

Require

- Login
- Admin Role

Unauthorized users should be redirected.

---

# Authorization

Role-Based Access Control (RBAC)

Customer

Cannot access

- Admin Dashboard

Admin

Can access everything.

---

# Security Rules

Always

- Rely on Supabase Auth for password hashing and credential storage
- Validate JWT
- Validate Sessions
- Use HTTPS
- Protect API Routes
- Validate Input
- Sanitize User Data

Never

- Store passwords in the application database
- Expose secrets
- Trust client-side validation

---

# Authentication APIs

Customer

- Register
- Login
- Login with Google
- Register with Google
- Logout
- Forgot Password
- Reset Password
- Verify Email

Admin

- Admin Login

---

# Future Authentication Features

Future versions may include

- GitHub Login
- Apple Login
- Two Factor Authentication (2FA)
- Multi Device Login
- Login History
- Device Management

---

# Error Handling

Provide user-friendly messages.

Examples

- Invalid Email
- Wrong Password
- Email Already Exists
- Verification Required
- Account Suspended

Never expose internal server errors.

---

# Final Authentication Philosophy

Authentication should prioritize

- Security
- Simplicity
- Reliability
- Fast User Experience

Every authentication flow should be intuitive, secure, and consistent across the application.