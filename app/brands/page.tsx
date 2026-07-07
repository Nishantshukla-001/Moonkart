import type { Metadata } from "next";

import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { BrandCard } from "@/components/products/BrandCard";
import { getBrands } from "@/features/categories/services/brand.service";
import { placeholderImage } from "@/lib/placeholderImages";

export const metadata: Metadata = {
  title: "Shop by Brand",
  description: "Browse every brand available on MoonKart.",
};

export default async function BrandsPage() {
  const brands = await getBrands();

  return (
    <Container className="flex flex-col gap-8 py-10 sm:py-12">
      <div>
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Brands" }]} />
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-text-primary sm:text-[32px]">
          Shop by Brand
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-5 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {brands.map((brand) => (
          <BrandCard
            key={brand.id}
            name={brand.name}
            slug={brand.slug}
            logo={brand.logo ?? placeholderImage(`moonkart-brand-${brand.slug}`, 400, 300)}
            productCount={brand._count.products}
          />
        ))}
      </div>
    </Container>
  );
}
