import type { Metadata } from "next";

import { AddressesPageClient } from "@/features/addresses/components/AddressesPageClient";
import { getAddresses } from "@/features/addresses/services/address.service";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "My Addresses",
  description: "Manage your MoonKart delivery addresses.",
};

export default async function AddressesPage() {
  const user = await requireUser();
  const addresses = await getAddresses(user.id);

  return <AddressesPageClient addresses={addresses} />;
}
