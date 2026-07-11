import type { NextRequest } from "next/server";

import { getNotificationsForUser } from "@/features/notifications/services/notification.service";
import { getCurrentUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return apiError("Not authenticated.", [], 401);

  const page = Number(request.nextUrl.searchParams.get("page")) || 1;
  const pageSize = Number(request.nextUrl.searchParams.get("pageSize")) || 20;

  const result = await getNotificationsForUser(user.id, page, pageSize);
  return apiSuccess(result, "Notifications fetched.");
}
