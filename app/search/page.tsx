import type { Metadata } from "next";

import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { ProductListingResults } from "@/features/products/components/ProductListingResults";
import { productQuerySchema } from "@/features/products/validation/productQuery.schema";

export const metadata: Metadata = {
  title: "Search Results",
  description: "Search the MoonKart catalog.",
};

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const rawQuery = typeof params.q === "string" ? params.q : "";
  const query = productQuerySchema.parse({ ...params, search: rawQuery || undefined });

  return (
    <>
      <Container className="pt-8">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Search" }]} />
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-text-primary sm:text-[32px]">
          {rawQuery ? `Results for "${rawQuery}"` : "Search"}
        </h1>
      </Container>
      {rawQuery ? (
        <ProductListingResults
          query={query}
          basePath="/search"
          emptyTitle="No results found"
          emptyDescription={`We couldn't find anything matching "${rawQuery}". Try a different search term.`}
        />
      ) : (
        <Container className="py-16 text-center text-text-secondary">
          Enter a search term to find products.
        </Container>
      )}
    </>
  );
}
