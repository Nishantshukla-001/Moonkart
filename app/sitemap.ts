import type { MetadataRoute } from "next";

import { siteConfig } from "@/constants/config";
import { ROUTES } from "@/constants/routes";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    ROUTES.home,
    ROUTES.products,
    ROUTES.categories,
    ROUTES.about,
    ROUTES.contact,
  ];

  return staticRoutes.map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
  }));
}
