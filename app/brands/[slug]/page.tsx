import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { siteConfig } from "@/constants/config";
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
  if (!brand) return { title: "Brand" };

  const title = brand.name;
  const description = brand.description ?? `Shop ${brand.name} at ${siteConfig.name}.`;
  const url = `${siteConfig.url}/brands/${brand.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", title, description, url, ...(brand.logo && { images: [{ url: brand.logo }] }) },
    twitter: { card: "summary_large_image", title, description, ...(brand.logo && { images: [brand.logo] }) },
  };
}

export default async function BrandPage({ params, searchParams }: BrandPageProps) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);

  if (!brand || !brand.isActive) notFound();

  const rawParams = await searchParams;
  const query = productQuerySchema.parse({ ...rawParams, brand: slug });
  const basePath = `/brands/${slug}`;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Brands", item: `${siteConfig.url}/brands` },
      { "@type": "ListItem", position: 3, name: brand.name },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
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
