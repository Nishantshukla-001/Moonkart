import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FeaturedCategoriesManager } from "@/features/homepage/components/FeaturedCategoriesManager";
import { FeaturedSubCategoriesManager } from "@/features/homepage/components/FeaturedSubCategoriesManager";
import { HomepageContentForm } from "@/features/homepage/components/HomepageContentForm";
import {
  getAvailableCategoriesForFeature,
  getAvailableSubCategoriesForFeature,
  getFeaturedCategoriesAdmin,
  getFeaturedSubCategoriesAdmin,
} from "@/features/homepage/services/featuredCategory.service";
import { getHomepageContent } from "@/features/homepage/services/homepageContent.service";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Homepage Content" };

export default async function AdminHomepagePage() {
  await requireAdmin();

  const [content, featuredCategories, availableCategories, featuredSubCategories, availableSubCategories] =
    await Promise.all([
      getHomepageContent(),
      getFeaturedCategoriesAdmin(),
      getAvailableCategoriesForFeature(),
      getFeaturedSubCategoriesAdmin(),
      getAvailableSubCategoriesForFeature(),
    ]);

  return (
    <>
      <AdminPageHeader
        title="Homepage Content"
        description="Everything customers see on the homepage — editable without touching code."
        breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Homepage Content" }]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Featured Categories — Order &amp; Visibility</CardTitle>
          <CardDescription>
            Choose which real store categories appear in the homepage&apos;s Featured Categories grid.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FeaturedCategoriesManager
            initialFeatured={featuredCategories}
            availableCategories={availableCategories}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Moon Essentials — Order &amp; Visibility</CardTitle>
          <CardDescription>
            Choose which real subcategories appear in the homepage&apos;s Moon Essentials grid.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FeaturedSubCategoriesManager
            initialFeatured={featuredSubCategories}
            availableSubCategories={availableSubCategories}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Homepage Content</CardTitle>
          <CardDescription>
            Hero, announcement bar, promotional banner, section titles, and visibility toggles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HomepageContentForm content={content} />
        </CardContent>
      </Card>
    </>
  );
}
