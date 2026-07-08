import type { NextRequest } from "next/server";

import { createAddress, getAddresses } from "@/features/addresses/services/address.service";
import { addressSchema } from "@/features/addresses/validation/address.schema";
import { getCurrentUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return apiError("Not authenticated.", [], 401);

  const addresses = await getAddresses(user.id);
  return apiSuccess(addresses, "Addresses fetched.");
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return apiError("Not authenticated.", [], 401);

  const body = await request.json().catch(() => null);
  if (!body) return apiError("Invalid request body.", [], 400);

  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "Validation failed.",
      parsed.error.issues.map((issue) => issue.message),
      422
    );
  }

  const address = await createAddress(user.id, parsed.data);
  return apiSuccess(address, "Address added.", 201);
}
