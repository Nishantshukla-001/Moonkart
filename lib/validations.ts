import { z } from "zod";

/**
 * Shared validation primitives. Feature-specific schemas (e.g.
 * features/auth/validation) compose these instead of redefining them.
 *
 * Password policy per docs/Authentication.md: min 8 characters, at least
 * one uppercase letter, one lowercase letter, one number, one special
 * character.
 */
export const emailSchema = z.email("Enter a valid email address");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[0-9]/, "Password must contain a number")
  .regex(/[^A-Za-z0-9]/, "Password must contain a special character");

export const phoneSchema = z
  .string()
  .trim()
  .min(7, "Enter a valid phone number")
  .max(20, "Enter a valid phone number")
  .regex(/^[+\d][\d\s-]*$/, "Enter a valid phone number");

export const nameSchema = z
  .string()
  .trim()
  .min(1, "This field is required")
  .max(60, "Must be under 60 characters");
