import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { getBrandBySlug } from "@/features/categories/services/brand.service";
import { ProductListingResults } from "@/features/products/components/ProductListingResults";
import { productQuerySchema } from "@/features/products/validation/productQuery.schema";

interface BrandPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);

  return {
    title: brand ? brand.name : "Brand",
    description: brand?.description ?? "Browse this MoonKart brand.",
  };
}

export default async function BrandPage({ params, searchParams }: BrandPageProps) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);

  if (!brand || !brand.isActive) notFound();

  const rawParams = await searchParams;
  const query = productQuerySchema.parse({ ...rawParams, brand: slug });
  const basePath = `/brands/${slug}`;

  return (
    <>
      <Container className="pt-8">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Brands", href: "/brands" }, { label: brand.name }]} />
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-text-primary sm:text-[32px]">
          {brand.name}
        </h1>
        {brand.description && (
          <p className="mt-2 max-w-2xl text-base text-text-secondary">{brand.description}</p>
        )}
      </Container>

      <ProductListingResults
        query={query}
        basePath={basePath}
        hideBrandFilter
        emptyTitle="No products from this brand yet"
        emptyDescription="Check back soon, or explore another brand."
      />
    </>
  );
}
