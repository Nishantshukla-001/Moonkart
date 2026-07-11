import type { NextRequest } from "next/server";

import { getStoreSettings, updateStoreSettings } from "@/features/admin/services/storeSettings.service";
import { storeSettingsInputSchema } from "@/features/admin/validation/storeSettings.schema";
import { getCurrentAdmin } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Forbidden.", [], 403);

  const settings = await getStoreSettings();
  return apiSuccess(settings, "Store settings fetched.");
}

export async function PUT(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Forbidden.", [], 403);

  const body = await request.json().catch(() => null);
  if (!body) return apiError("Invalid request body.", [], 400);

  const parsed = storeSettingsInputSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "Validation failed.",
      parsed.error.issues.map((issue) => issue.message),
      422
    );
  }

  const updated = await updateStoreSettings(parsed.data);
  return apiSuccess(updated, "Store settings updated.");
}
