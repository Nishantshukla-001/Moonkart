import { setDefaultAddress } from "@/features/addresses/services/address.service";
import { getCurrentUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function PUT(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return apiError("Not authenticated.", [], 401);

  const { id } = await params;
  const address = await setDefaultAddress(user.id, id);
  if (!address) return apiError("Address not found.", [], 404);

  return apiSuccess(address, "Default address updated.");
}
