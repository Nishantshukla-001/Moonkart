import type { Metadata } from "next";

import { BrandsClient } from "@/features/admin/components/BrandsClient";
import { getBrands } from "@/features/categories/services/brand.service";

export const metadata: Metadata = { title: "Brands" };

export default async function AdminBrandsPage() {
  const brands = await getBrands({ includeInactive: true });
  return <BrandsClient initialBrands={brands} />;
}
