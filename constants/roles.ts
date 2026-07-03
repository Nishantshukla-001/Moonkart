/**
 * MoonKart is a single-vendor store — the Admin is the sole business owner
 * and seller. Only two roles exist.
 */
export const UserRole = {
  CUSTOMER: "CUSTOMER",
  ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
