import "./globals.css";

import { SiteChrome } from "@/components/layout/SiteChrome";
import { contactInfo, siteConfig, socialLinks } from "@/constants/config";
import { getCategories } from "@/features/categories/services/category.service";
import { defaultMetadata } from "@/lib/seo";
import { inter, poppins } from "@/lib/fonts";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getCategories();

  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <Providers>
          <SiteChrome categories={categories}>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
