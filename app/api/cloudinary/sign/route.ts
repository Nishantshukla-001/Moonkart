import { signUpload } from "@/lib/cloudinary";
import { getCurrentUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";

/** Signs a direct browser-to-Cloudinary upload for any authenticated customer (e.g. attaching photos to a review) — the API secret never leaves the server. */
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return apiError("Not authenticated.", [], 401);

  const params = signUpload({});
  return apiSuccess(params, "Upload signature issued.");
}
