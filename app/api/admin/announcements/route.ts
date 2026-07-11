import { createAnnouncementForAllUsers } from "@/features/notifications/services/notification.service";
import { announcementSchema } from "@/features/admin/validation/announcement.schema";
import { getCurrentAdmin } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Forbidden.", [], 403);

  const body = await request.json().catch(() => null);
  if (!body) return apiError("Invalid request body.", [], 400);

  const parsed = announcementSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "Validation failed.",
      parsed.error.issues.map((issue) => issue.message),
      422
    );
  }

  const result = await createAnnouncementForAllUsers(
    parsed.data.title,
    parsed.data.message,
    parsed.data.link || undefined
  );
  return apiSuccess(result, `Announcement sent to ${result.count} customer${result.count === 1 ? "" : "s"}.`);
}
