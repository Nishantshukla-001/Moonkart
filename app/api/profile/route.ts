import type { NextRequest } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { prisma } from "@/lib/prisma";
import { nameSchema, phoneSchema } from "@/lib/validations";

const updateProfileSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema.optional().or(z.literal("")),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return apiError("Not authenticated.", [], 401);
  }
  return apiSuccess(user, "Profile fetched.");
}

export async function PUT(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return apiError("Not authenticated.", [], 401);
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return apiError("Invalid request body.", [], 400);
  }

  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "Validation failed.",
      parsed.error.issues.map((issue) => issue.message),
      422
    );
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phone: parsed.data.phone || null,
    },
  });

  return apiSuccess(updated, "Profile updated successfully.");
}
