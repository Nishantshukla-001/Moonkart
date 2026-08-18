import "./globals.css";

import { unstable_cache } from "next/cache";

import { SiteChrome } from "@/components/layout/SiteChrome";
import { contactInfo, siteConfig, socialLinks } from "@/constants/config";
import { getCategories } from "@/features/categories/services/category.service";
import { getStoreSettings } from "@/features/admin/services/storeSettings.service";
import { getHomepageContent } from "@/features/homepage/services/homepageContent.service";
import { defaultMetadata, toJsonLd } from "@/lib/seo";
import { Providers } from "@/providers/Providers";

export const metadata = defaultMetadata;

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
  logo: `${siteConfig.url}/icon.jpg`,
  description: siteConfig.description,
  email: contactInfo.email,
  telephone: contactInfo.phone,
  sameAs: [socialLinks.instagram.url],
};

// The root layout wraps every route, so these 3 reads previously ran on
// every single page view. Cached with a 60s window (matching the homepage's
// own ISR interval) rather than tag-based invalidation — admin edits to
// categories/store settings/homepage content may take up to 60s to appear
// in the nav/footer/announcement bar specifically, while the homepage's own
// content still updates immediately via its existing revalidatePath("/").
const getCachedLayoutChrome = unstable_cache(
  async () => {
    const [categories, storeSettings, homepageContent] = await Promise.all([
      getCategories(),
      getStoreSettings(),
      getHomepageContent(),
    ]);
    return { categories, storeSettings, homepageContent };
  },
  ["root-layout-chrome"],
  { revalidate: 60 }
);

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { categories, storeSettings, homepageContent } = await getCachedLayoutChrome();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(organizationJsonLd) }} />
        <Providers>
          <SiteChrome categories={categories} storeSettings={storeSettings} homepageContent={homepageContent}>
            {children}
          </SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
