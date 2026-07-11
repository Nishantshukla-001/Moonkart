import { signUpload } from "@/lib/cloudinary";
import { getCurrentAdmin } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";

/** Issues a short-lived signature so the browser can upload directly to Cloudinary — the API secret never leaves the server. */
export async function POST() {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Forbidden.", [], 403);

  const params = signUpload({});
  return apiSuccess(params, "Upload signature issued.");
}
