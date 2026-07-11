import type { NextRequest } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { destroyCloudinaryAsset } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

const updateAvatarSchema = z.object({
  avatarUrl: z.url(),
  avatarPublicId: z.string().min(1),
});

export async function PUT(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return apiError("Not authenticated.", [], 401);
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return apiError("Invalid request body.", [], 400);
  }

  const parsed = updateAvatarSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "Validation failed.",
      parsed.error.issues.map((issue) => issue.message),
      422
    );
  }

  const previousPublicId = user.avatarPublicId;

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { avatar: parsed.data.avatarUrl, avatarPublicId: parsed.data.avatarPublicId },
  });

  if (previousPublicId && previousPublicId !== parsed.data.avatarPublicId) {
    await destroyCloudinaryAsset(previousPublicId);
  }

  return apiSuccess(updated, "Profile photo updated.");
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) {
    return apiError("Not authenticated.", [], 401);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { avatar: null, avatarPublicId: null },
  });

  if (user.avatarPublicId) {
    await destroyCloudinaryAsset(user.avatarPublicId);
  }

  return apiSuccess(updated, "Profile photo removed.");
}
