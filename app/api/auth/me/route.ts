import { getCurrentUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return apiError("Not authenticated.", [], 401);
  }

  return apiSuccess(user, "Current user.");
}
