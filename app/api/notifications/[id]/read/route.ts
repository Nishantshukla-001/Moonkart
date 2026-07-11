import { markNotificationRead } from "@/features/notifications/services/notification.service";
import { getCurrentUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function PUT(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return apiError("Not authenticated.", [], 401);

  const { id } = await params;
  const marked = await markNotificationRead(user.id, id);
  if (!marked) return apiError("Notification not found.", [], 404);

  return apiSuccess(null, "Notification marked as read.");
}
