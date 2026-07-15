import type { NextRequest } from "next/server";

import { getHomepageContent, updateHomepageContent } from "@/features/homepage/services/homepageContent.service";
import { homepageContentInputSchema } from "@/features/homepage/validation/homepageContent.schema";
import { getCurrentAdmin } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Forbidden.", [], 403);

  const content = await getHomepageContent();
  return apiSuccess(content, "Homepage content fetched.");
}

export async function PUT(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Forbidden.", [], 403);

  const body = await request.json().catch(() => null);
  if (!body) return apiError("Invalid request body.", [], 400);

  const parsed = homepageContentInputSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "Validation failed.",
      parsed.error.issues.map((issue) => issue.message),
      422
    );
  }

  const updated = await updateHomepageContent(parsed.data);
  return apiSuccess(updated, "Homepage content updated.");
}
