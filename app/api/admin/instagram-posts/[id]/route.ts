import type { NextRequest } from "next/server";

import {
  deleteInstagramPost,
  updateInstagramPost,
} from "@/features/instagram/services/instagramPost.service";
import { updateInstagramPostSchema } from "@/features/instagram/validation/instagramPost.schema";
import { getCurrentAdmin } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Forbidden.", [], 403);

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return apiError("Invalid request body.", [], 400);

  const parsed = updateInstagramPostSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "Validation failed.",
      parsed.error.issues.map((issue) => issue.message),
      422
    );
  }

  try {
    const post = await updateInstagramPost(id, parsed.data);
    return apiSuccess(post, "Image updated.");
  } catch {
    return apiError("Image not found.", [], 404);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Forbidden.", [], 403);

  const { id } = await params;

  try {
    await deleteInstagramPost(id);
    return apiSuccess(null, "Image deleted.");
  } catch {
    return apiError("Image not found.", [], 404);
  }
}
