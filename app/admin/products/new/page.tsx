import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProductForm } from "@/features/admin/components/ProductForm";
import { getBrands } from "@/features/categories/services/brand.service";
import { getCategoriesAdmin } from "@/features/categories/services/category.service";

export const metadata: Metadata = { title: "Add Product" };

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([getCategoriesAdmin(), getBrands({ includeInactive: true })]);

  return (
    <>
      <AdminPageHeader
        title="Add Product"
        description="Create a new product in your catalog."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Products", href: "/admin/products" },
          { label: "Add Product" },
        ]}
      />
      <ProductForm categories={categories} brands={brands} />
    </>
  );
}
