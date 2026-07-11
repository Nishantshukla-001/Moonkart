import { markAllNotificationsRead } from "@/features/notifications/services/notification.service";
import { getCurrentUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function PUT() {
  const user = await getCurrentUser();
  if (!user) return apiError("Not authenticated.", [], 401);

  await markAllNotificationsRead(user.id);
  return apiSuccess(null, "All notifications marked as read.");
}
