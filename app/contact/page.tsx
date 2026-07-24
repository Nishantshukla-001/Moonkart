import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/card";
import { businessAddress, contactInfo, siteConfig } from "@/constants/config";
import { getStoreSettings } from "@/features/admin/services/storeSettings.service";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Get in touch with ${siteConfig.name} — email, phone, WhatsApp, and our business address.`,
  alternates: { canonical: `${siteConfig.url}/contact` },
  openGraph: {
    type: "website",
    title: `Contact Us | ${siteConfig.name}`,
    description: `Get in touch with ${siteConfig.name} — email, phone, WhatsApp, and our business address.`,
    url: `${siteConfig.url}/contact`,
  },
  twitter: {
    card: "summary",
    title: `Contact Us | ${siteConfig.name}`,
    description: `Get in touch with ${siteConfig.name} — email, phone, WhatsApp, and our business address.`,
  },
};

export default async function ContactPage() {
  const storeSettings = await getStoreSettings();
  const whatsappNumber = storeSettings.whatsappNumber;

  const contactRows = [
    { icon: Mail, label: contactInfo.supportEmail, href: `mailto:${contactInfo.supportEmail}` },
    { icon: Phone, label: contactInfo.phone, href: `tel:${contactInfo.phone}` },
    ...(whatsappNumber
      ? [{ icon: MessageCircle, label: `WhatsApp: ${whatsappNumber}`, href: `https://wa.me/${whatsappNumber}` }]
      : []),
    { icon: MapPin, label: businessAddress.full, href: undefined },
  ];

  return (
    <Container className="flex flex-col items-center py-16 sm:py-20">
      <div className="flex w-full max-w-2xl flex-col items-center gap-3 text-center">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-text-primary sm:text-[34px]">
          Contact Us
        </h1>
        <span aria-hidden="true" className="h-px w-12 bg-blush" />
        <p className="max-w-md text-base leading-[170%] text-text-secondary">
          Questions about an order, a product, or anything else? We&apos;d love to hear from you.
        </p>
      </div>

      <Card className="mt-10 w-full max-w-2xl gap-4 p-8 sm:p-10">
        {contactRows.map((row) => {
          const content = (
            <>
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-blush shadow-soft transition-transform duration-[250ms] group-hover:scale-110">
                <row.icon className="size-5 text-text-primary" strokeWidth={2.25} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1 pt-2 text-base leading-snug text-text-primary break-words">
                {row.label}
              </span>
            </>
          );
          return row.href ? (
            <a
              key={row.label}
              href={row.href}
              className="group flex min-w-0 items-start gap-4 rounded-lg px-2 py-1 transition-colors duration-[250ms] hover:text-blush-hover"
            >
              {content}
            </a>
          ) : (
            <span key={row.label} className="group flex min-w-0 items-start gap-4 px-2 py-1">
              {content}
            </span>
          );
        })}
      </Card>
    </Container>
  );
}
