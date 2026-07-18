import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { siteConfig } from "@/constants/config";
import { getCategoryBySlug } from "@/features/categories/services/category.service";
import { ProductListingResults } from "@/features/products/components/ProductListingResults";
import { productQuerySchema } from "@/features/products/validation/productQuery.schema";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category" };

  const title = category.name;
  const description = category.description ?? `Shop ${category.name} at ${siteConfig.name}.`;
  const url = `${siteConfig.url}/categories/${category.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", title, description, url, ...(category.image && { images: [{ url: category.image }] }) },
    twitter: { card: "summary_large_image", title, description, ...(category.image && { images: [category.image] }) },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  // Inactive categories are deliberately excluded from nav/homepage/filters
  // (getCategories() filters isActive), but the page itself still resolves
  // so existing links to their products (breadcrumbs, bookmarks, search
  // engines) never 404 — only discovery is hidden, not direct access.
  if (!category) notFound();

  const rawParams = await searchParams;
  const query = productQuerySchema.parse({ ...rawParams, category: slug });
  const basePath = `/categories/${slug}`;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Categories", item: `${siteConfig.url}/categories` },
      { "@type": "ListItem", position: 3, name: category.name },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Container className="pt-8">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Categories", href: "/categories" }, { label: category.name }]} />
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-text-primary sm:text-[32px]">
          {category.name}
        </h1>
        {category.description && (
          <p className="mt-2 max-w-2xl text-base text-text-secondary">{category.description}</p>
        )}

        {category.subCategories.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {category.subCategories.map((subCategory) => (
              <Link
                key={subCategory.id}
                href={`${basePath}?subCategory=${subCategory.slug}`}
                className="rounded-full border border-border-medium px-4 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:border-blush hover:bg-blush-light hover:text-text-primary"
              >
                {subCategory.name}
              </Link>
            ))}
          </div>
        )}
      </Container>

      <ProductListingResults
        query={query}
        basePath={basePath}
        hideCategoryFilter
        emptyTitle="No products in this category yet"
        emptyDescription="Check back soon, or explore another category."
      />
    </>
  );
}
