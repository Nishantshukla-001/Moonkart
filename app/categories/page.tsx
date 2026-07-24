import type { Metadata } from "next";

import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { CategoryCard } from "@/components/categories/CategoryCard";
import { siteConfig } from "@/constants/config";
import { getCategories } from "@/features/categories/services/category.service";
import { placeholderImage } from "@/lib/placeholderImages";

const title = "Shop by Category";
const description = "Browse every MoonKart category.";
const url = `${siteConfig.url}/categories`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: { type: "website", title: `${title} | ${siteConfig.name}`, description, url },
  twitter: { card: "summary", title: `${title} | ${siteConfig.name}`, description },
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <Container className="flex flex-col gap-8 py-10 sm:py-12">
      <div>
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Categories" }]} />
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-text-primary sm:text-[32px]">
          Shop by Category
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-5 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            name={category.name}
            slug={category.slug}
            image={category.image ?? placeholderImage(`moonkart-cat-${category.slug}`, 600, 450)}
            productCount={category._count.products}
          />
        ))}
      </div>
    </Container>
  );
}
