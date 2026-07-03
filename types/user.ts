import type { User } from "@prisma/client";

/**
 * Canonical application user shape — aliases the Prisma model so there is a
 * single source of truth for its fields (docs/Database.md § User Table).
 */
export type IUser = User;
