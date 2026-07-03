import { apiSuccess } from "@/lib/apiResponse";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return apiSuccess(null, "Logged out successfully.");
}
