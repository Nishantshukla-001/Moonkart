import type { NextRequest } from "next/server";

import { deleteAddress, updateAddress } from "@/features/addresses/services/address.service";
import { updateAddressSchema } from "@/features/addresses/validation/address.schema";
import { getCurrentUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return apiError("Not authenticated.", [], 401);

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return apiError("Invalid request body.", [], 400);

  const parsed = updateAddressSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "Validation failed.",
      parsed.error.issues.map((issue) => issue.message),
      422
    );
  }

  const address = await updateAddress(user.id, id, parsed.data);
  if (!address) return apiError("Address not found.", [], 404);

  return apiSuccess(address, "Address updated.");
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return apiError("Not authenticated.", [], 401);

  const { id } = await params;
  const deleted = await deleteAddress(user.id, id);
  if (!deleted) return apiError("Address not found.", [], 404);

  return apiSuccess(null, "Address deleted.");
}
