import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProductForm } from "@/features/admin/components/ProductForm";
import { getBrands } from "@/features/categories/services/brand.service";
import { getCategoriesAdmin } from "@/features/categories/services/category.service";
import { getProductByIdAdmin } from "@/features/products/services/product.service";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Edit Product" };

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  const [product, categories, brands] = await Promise.all([
    getProductByIdAdmin(id),
    getCategoriesAdmin(),
    getBrands({ includeInactive: true }),
  ]);

  if (!product) notFound();

  return (
    <>
      <AdminPageHeader
        title={`Edit ${product.name}`}
        description="Update this product's details, variants, images, and SEO."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Products", href: "/admin/products" },
          { label: "Edit" },
        ]}
      />
      <ProductForm product={product} categories={categories} brands={brands} />
    </>
  );
}
