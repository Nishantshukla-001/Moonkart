import type { MetadataRoute } from "next";

import { siteConfig } from "@/constants/config";
import { ROUTES } from "@/constants/routes";
import { getBrands } from "@/features/categories/services/brand.service";
import { getCategories } from "@/features/categories/services/category.service";
import { getAllProductSlugsForSitemap } from "@/features/products/services/product.service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, brands] = await Promise.all([
    getAllProductSlugsForSitemap(),
    getCategories(),
    getBrands(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    ROUTES.home,
    ROUTES.products,
    ROUTES.categories,
    ROUTES.brands,
    ROUTES.search,
    ROUTES.about,
    ROUTES.contact,
  ].map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${siteConfig.url}${ROUTES.product(product.slug)}`,
    lastModified: product.updatedAt,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${siteConfig.url}${ROUTES.category(category.slug)}`,
    lastModified: category.updatedAt,
  }));

  const brandRoutes: MetadataRoute.Sitemap = brands.map((brand) => ({
    url: `${siteConfig.url}${ROUTES.brand(brand.slug)}`,
    lastModified: brand.updatedAt,
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...brandRoutes];
}
