import type { Metadata } from "next";

import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/card";
import { contactInfo, siteConfig } from "@/constants/config";

const title = "Privacy Policy";
const description = `How ${siteConfig.name} collects, uses, and protects your information.`;
const url = `${siteConfig.url}/privacy-policy`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: { type: "website", title: `${title} | ${siteConfig.name}`, description, url },
  twitter: { card: "summary", title: `${title} | ${siteConfig.name}`, description },
};

const sections = [
  {
    heading: "Information We Collect",
    body: [
      "When you create an account, place an order, or contact us, we collect information such as your name, email address, phone number, shipping and billing address, and order history.",
      "We also automatically collect limited technical information (such as browser type and general usage patterns) to keep the site secure and working correctly.",
    ],
  },
  {
    heading: "How We Use Your Information",
    body: [
      "We use your information to process and deliver your orders, communicate with you about your account or purchases, respond to support requests, and improve our products and service.",
      "We do not sell your personal information to third parties.",
    ],
  },
  {
    heading: "Payment Information",
    body: [
      `${siteConfig.name} does not store your full payment card details on our servers. Payments are processed by our payment provider, and order records only retain what is required for accounting and customer support.`,
    ],
  },
  {
    heading: "Cookies",
    body: [
      "We use essential cookies to keep you signed in and to remember items in your cart. These are necessary for the site to function and cannot be disabled without affecting core functionality.",
    ],
  },
  {
    heading: "Third-Party Services",
    body: [
      "We use trusted third-party services to operate the store, including a database and authentication provider, an image hosting service, and (where applicable) a payment gateway. These providers only receive the information necessary to perform their function and are bound by their own privacy and security obligations.",
    ],
  },
  {
    heading: "Data Retention",
    body: [
      "We retain account and order information for as long as your account is active and as needed to comply with our legal and accounting obligations. You may request deletion of your account by contacting us, subject to any records we're required to keep by law.",
    ],
  },
  {
    heading: "Your Rights",
    body: [
      "You can review and update your account details at any time from your profile. To request a copy of your data, ask a question, or request account deletion, contact us using the details below.",
    ],
  },
  {
    heading: "Changes to This Policy",
    body: [
      "We may update this policy from time to time. Continued use of the site after an update means you accept the revised policy.",
    ],
  },
  {
    heading: "Contact Us",
    body: [`Questions about this policy can be sent to ${contactInfo.email} or ${contactInfo.phone}.`],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <Container className="flex flex-col items-center py-16 sm:py-20">
      <div className="flex w-full max-w-2xl flex-col items-center gap-3 text-center">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-text-primary sm:text-[34px]">
          Privacy Policy
        </h1>
        <span aria-hidden="true" className="h-px w-12 bg-blush" />
        <p className="text-sm text-text-muted">Last updated: {new Date().getFullYear()}</p>
      </div>

      <Card className="mt-10 flex w-full max-w-2xl flex-col gap-8 p-8 sm:p-10">
        {sections.map((section) => (
          <div key={section.heading} className="flex flex-col gap-2.5">
            <h2 className="font-heading text-lg font-semibold text-text-primary">{section.heading}</h2>
            {section.body.map((paragraph, index) => (
              <p key={index} className="text-sm leading-[170%] text-text-secondary">
                {paragraph}
              </p>
            ))}
          </div>
        ))}
      </Card>
    </Container>
  );
}
