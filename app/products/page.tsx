import type { Metadata } from "next";

import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { ProductListingResults } from "@/features/products/components/ProductListingResults";
import { productQuerySchema } from "@/features/products/validation/productQuery.schema";

export const metadata: Metadata = {
  title: "Shop All Products",
  description: "Browse the full MoonKart catalog of jewellery, beauty, apparel, and lifestyle products.",
};

interface ProductsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const query = productQuerySchema.parse(params);

  return (
    <>
      <Container className="pt-8">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Products" }]} />
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-text-primary sm:text-[32px]">
          Shop All Products
        </h1>
      </Container>
      <ProductListingResults query={query} basePath="/products" />
    </>
  );
}
