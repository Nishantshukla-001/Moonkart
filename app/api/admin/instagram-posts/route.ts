import type { NextRequest } from "next/server";

import {
  createInstagramPost,
  getInstagramPostsAdmin,
} from "@/features/instagram/services/instagramPost.service";
import { instagramPostInputSchema } from "@/features/instagram/validation/instagramPost.schema";
import { getCurrentAdmin } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Forbidden.", [], 403);

  const posts = await getInstagramPostsAdmin();
  return apiSuccess(posts, "Instagram posts fetched.");
}

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Forbidden.", [], 403);

  const body = await request.json().catch(() => null);
  if (!body) return apiError("Invalid request body.", [], 400);

  const parsed = instagramPostInputSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "Validation failed.",
      parsed.error.issues.map((issue) => issue.message),
      422
    );
  }

  const post = await createInstagramPost(parsed.data);
  return apiSuccess(post, "Image added.", 201);
}
