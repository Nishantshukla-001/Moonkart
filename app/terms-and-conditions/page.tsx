import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/card";
import { contactInfo, siteConfig } from "@/constants/config";
import { ROUTES } from "@/constants/routes";

const title = "Terms & Conditions";
const description = `The terms and conditions for using ${siteConfig.name}.`;
const url = `${siteConfig.url}/terms-and-conditions`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: { type: "website", title: `${title} | ${siteConfig.name}`, description, url },
  twitter: { card: "summary", title: `${title} | ${siteConfig.name}`, description },
};

const sections = [
  {
    heading: "Acceptance of Terms",
    body: [
      `By accessing or using ${siteConfig.name}, you agree to these Terms & Conditions. If you don't agree, please don't use the site.`,
    ],
  },
  {
    heading: "Your Account",
    body: [
      "You're responsible for keeping your account credentials confidential and for all activity under your account. Let us know right away if you suspect unauthorized use.",
    ],
  },
  {
    heading: "Orders & Payment",
    body: [
      "Placing an order is an offer to buy the selected products at the listed price. We may cancel or refuse any order — for example, if a product turns out to be unavailable or we suspect fraudulent activity.",
      "Available payment methods are shown at checkout.",
    ],
  },
  {
    heading: "Pricing & Product Information",
    body: [
      "We try to keep prices, descriptions, and images accurate, but errors can occasionally happen. If we find a pricing or listing error on your order, we'll contact you before proceeding.",
    ],
  },
  {
    heading: "Shipping",
    body: [
      "Delivery timeframes shown at checkout are estimates, not guarantees. We're not responsible for delays caused by the courier or events outside our control.",
    ],
  },
  {
    heading: "Returns & Refunds",
    body: [], // rendered specially below with a link
  },
  {
    heading: "Acceptable Use",
    body: [
      "Please don't misuse the site — this includes attempting to access accounts or data that aren't yours, disrupting the service, or using it for any unlawful purpose.",
    ],
  },
  {
    heading: "Intellectual Property",
    body: [
      `All product photography, text, logos, and design on ${siteConfig.name} belong to us or our licensors and may not be reused without permission.`,
    ],
  },
  {
    heading: "Limitation of Liability",
    body: [
      `${siteConfig.name} is provided on an "as is" basis. To the fullest extent permitted by law, we aren't liable for indirect or consequential losses arising from your use of the site.`,
    ],
  },
  {
    heading: "Governing Law",
    body: ["These terms are governed by the laws of India, and any disputes will be subject to the courts of India."],
  },
  {
    heading: "Changes to These Terms",
    body: [
      "We may update these terms occasionally. Continuing to use the site after a change means you accept the updated terms.",
    ],
  },
  {
    heading: "Contact Us",
    body: [`Questions about these terms can be sent to ${contactInfo.email} or ${contactInfo.phone}.`],
  },
];

export default function TermsAndConditionsPage() {
  return (
    <Container className="flex flex-col items-center py-16 sm:py-20">
      <div className="flex w-full max-w-2xl flex-col items-center gap-3 text-center">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-text-primary sm:text-[34px]">
          Terms &amp; Conditions
        </h1>
        <span aria-hidden="true" className="h-px w-12 bg-blush" />
        <p className="text-sm text-text-muted">Last updated: {new Date().getFullYear()}</p>
      </div>

      <Card className="mt-10 flex w-full max-w-2xl flex-col gap-8 p-8 sm:p-10">
        {sections.map((section) => (
          <div key={section.heading} className="flex flex-col gap-2.5">
            <h2 className="font-heading text-lg font-semibold text-text-primary">{section.heading}</h2>
            {section.heading === "Returns & Refunds" ? (
              <p className="text-sm leading-[170%] text-text-secondary">
                Returns and refunds are handled according to our{" "}
                <Link href={ROUTES.returnPolicy} className="text-blush-hover underline underline-offset-2">
                  Return &amp; Refund Policy
                </Link>
                .
              </p>
            ) : (
              section.body.map((paragraph, index) => (
                <p key={index} className="text-sm leading-[170%] text-text-secondary">
                  {paragraph}
                </p>
              ))
            )}
          </div>
        ))}
      </Card>
    </Container>
  );
}
