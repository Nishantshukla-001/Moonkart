import "server-only";

import { prisma } from "@/lib/prisma";
import type { AddressInput, UpdateAddressInput } from "@/features/addresses/validation/address.schema";

export function getAddresses(userId: string) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

/** Scoped to `userId` so one customer can never read another's address. */
export function getOwnedAddress(userId: string, id: string) {
  return prisma.address.findFirst({ where: { id, userId } });
}

export async function createAddress(userId: string, input: AddressInput) {
  const existingCount = await prisma.address.count({ where: { userId } });
  const shouldBeDefault = input.isDefault || existingCount === 0;

  return prisma.$transaction(async (tx) => {
    if (shouldBeDefault) {
      await tx.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
    }

    return tx.address.create({
      data: { ...input, addressLine2: input.addressLine2 || null, userId, isDefault: shouldBeDefault },
    });
  });
}

export async function updateAddress(userId: string, id: string, input: UpdateAddressInput) {
  const existing = await getOwnedAddress(userId, id);
  if (!existing) return null;

  return prisma.$transaction(async (tx) => {
    if (input.isDefault) {
      await tx.address.updateMany({
        where: { userId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    return tx.address.update({
      where: { id },
      data: { ...input, addressLine2: input.addressLine2 || undefined },
    });
  });
}

export async function deleteAddress(userId: string, id: string) {
  const existing = await getOwnedAddress(userId, id);
  if (!existing) return false;

  await prisma.$transaction(async (tx) => {
    await tx.address.delete({ where: { id } });

    // If the deleted address was the default, promote the most recently
    // added remaining one so the user is never left without a default.
    if (existing.isDefault) {
      const next = await tx.address.findFirst({ where: { userId }, orderBy: { createdAt: "desc" } });
      if (next) await tx.address.update({ where: { id: next.id }, data: { isDefault: true } });
    }
  });

  return true;
}

export async function setDefaultAddress(userId: string, id: string) {
  const existing = await getOwnedAddress(userId, id);
  if (!existing) return null;

  return prisma.$transaction(async (tx) => {
    await tx.address.updateMany({
      where: { userId, isDefault: true, id: { not: id } },
      data: { isDefault: false },
    });
    return tx.address.update({ where: { id }, data: { isDefault: true } });
  });
}
