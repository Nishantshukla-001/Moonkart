import type { Metadata } from "next";

import { siteConfig } from "@/constants/config";

/**
 * Escapes `<` so a JSON-LD payload embedded via `dangerouslySetInnerHTML`
 * can never break out of its `<script>` tag — plain `JSON.stringify` does
 * not escape `<`, so an admin-entered value containing `</script>` would
 * otherwise inject arbitrary HTML/JS into every visitor's page.
 */
export function toJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Premium Fashion & Lifestyle Marketplace`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ["MoonKart", "fashion marketplace", "lifestyle marketplace", "online shopping India"],
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
  icons: {
    icon: "/icon.jpg",
  },
};
