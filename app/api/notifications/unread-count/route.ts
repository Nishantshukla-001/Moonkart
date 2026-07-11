import { getUnreadCount } from "@/features/notifications/services/notification.service";
import { getCurrentUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return apiError("Not authenticated.", [], 401);

  const count = await getUnreadCount(user.id);
  return apiSuccess({ count }, "Unread count fetched.");
}
