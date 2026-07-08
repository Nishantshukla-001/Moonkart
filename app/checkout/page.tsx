import type { Metadata } from "next";

import { getAddresses } from "@/features/addresses/services/address.service";
import { CheckoutClient } from "@/features/checkout/components/CheckoutClient";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Review your order and complete checkout on MoonKart.",
};

export default async function CheckoutPage() {
  const user = await requireUser();
  const addresses = await getAddresses(user.id);

  return <CheckoutClient addresses={addresses} />;
}
