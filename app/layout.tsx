import "./globals.css";

import { SiteChrome } from "@/components/layout/SiteChrome";
import { getCategories } from "@/features/categories/services/category.service";
import { defaultMetadata } from "@/lib/seo";
import { inter, poppins } from "@/lib/fonts";
import { Providers } from "@/providers/Providers";

export const metadata = defaultMetadata;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getCategories();

  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col antialiased">
        <Providers>
          <SiteChrome categories={categories}>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
