"use client";

import { usePathname } from "next/navigation";
import type { StoreSettings } from "@prisma/client";

import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { BulkOrdersSection } from "@/components/footer/BulkOrdersSection";
import { Footer } from "@/components/footer/Footer";
import { Navbar } from "@/components/navigation/Navbar";
import type { IHomepageContent } from "@/types/homepageContent";
import type { ICategory } from "@/types/product";

/**
 * The Admin Dashboard renders its own sidebar/topbar shell (app/admin/layout.tsx)
 * instead of the storefront chrome. Every other route keeps the exact same
 * AnnouncementBar/Navbar/Footer wrapping as before this component existed.
 */
export function SiteChrome({
  categories,
  storeSettings,
  homepageContent,
  children,
}: {
  categories: ICategory[];
  storeSettings: StoreSettings;
  homepageContent: IHomepageContent;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <main className="min-w-0 flex-1">{children}</main>;
  }

  return (
    <>
      <AnnouncementBar
        text={homepageContent.announcementText}
        link={homepageContent.announcementLink}
        isEnabled={homepageContent.announcementIsEnabled}
      />
      <Navbar categories={categories} />
      <main className="min-w-0 flex-1">{children}</main>
      <BulkOrdersSection />
      <Footer storeSettings={storeSettings} homepageContent={homepageContent} />
    </>
  );
}
