import { Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import logo from "@/assets/logo.jpeg";
import { Container } from "@/components/layout/Container";
import { InstagramIcon } from "@/components/shared/InstagramIcon";
import { NewsletterForm } from "@/components/shared/NewsletterForm";
import { ROUTES } from "@/constants/routes";
import { businessAddress, contactInfo, siteConfig, socialLinks } from "@/constants/config";

const quickLinks = [
  { label: "Home", href: ROUTES.home },
  { label: "Products", href: ROUTES.products },
  { label: "About", href: ROUTES.about },
  { label: "Contact", href: ROUTES.contact },
];

const contactRows = [
  { icon: Mail, label: contactInfo.supportEmail, href: `mailto:${contactInfo.supportEmail}` },
  { icon: Phone, label: contactInfo.phone, href: `tel:${contactInfo.phone}` },
  { icon: MapPin, label: businessAddress.full, href: undefined },
];

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-heading text-[15px] font-semibold tracking-[0.3px] text-text-primary">
        {children}
      </h3>
      <span aria-hidden="true" className="h-px w-8 bg-blush" />
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border-light bg-gradient-to-b from-bg-dashboard via-blush-light/20 to-bg-dashboard shadow-[0_-4px_24px_-16px_rgba(47,47,47,0.08)]">
      <div aria-hidden="true" className="h-1 bg-gradient-to-r from-blush via-blush-hover to-warm-yellow" />

      <Container className="grid grid-cols-2 gap-x-6 gap-y-12 py-16 sm:py-20 lg:grid-cols-4 lg:gap-x-10 lg:gap-y-0 lg:divide-x lg:divide-border-light/70">
        {/* Brand — full width and centered on mobile/tablet for a boutique
            feel; a normal left-aligned column from lg up. */}
        <div className="col-span-2 flex flex-col items-center gap-4 text-center lg:col-span-1 lg:items-start lg:pr-6 lg:text-left">
          <div className="flex items-center gap-2.5">
            <Image
              src={logo}
              alt={siteConfig.name}
              width={38}
              height={38}
              className="rounded-full object-cover shadow-soft"
            />
            <span className="font-heading text-xl font-bold text-text-primary">
              {siteConfig.name}
            </span>
          </div>
          <p className="max-w-xs text-sm leading-[170%] text-text-secondary">
            {siteConfig.description}
          </p>
          <a
            href={socialLinks.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-fit items-center gap-2 rounded-full bg-background px-3.5 py-2 text-sm text-text-secondary shadow-soft transition-all duration-[300ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:text-blush-hover hover:shadow-soft-md"
          >
            <InstagramIcon className="size-4" />@{socialLinks.instagram.username}
          </a>
        </div>

        {/* Quick Links + Contact sit side by side even on the smallest
            screens (they're both short lists), instead of stacking the
            entire footer into one long column. */}
        <div className="flex flex-col gap-4 lg:pl-10">
          <SectionHeading>Quick Links</SectionHeading>
          <nav className="flex flex-col">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="w-fit rounded-md py-2 text-sm text-text-muted transition-all duration-[300ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:translate-x-1 hover:text-blush-hover"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-4 lg:pl-10">
          <SectionHeading>Contact</SectionHeading>
          <div className="flex flex-col gap-3.5">
            {contactRows.map((row) => {
              const content = (
                <>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blush shadow-soft transition-transform duration-[250ms] group-hover:scale-110">
                    <row.icon className="size-4 text-text-primary" strokeWidth={2.25} />
                  </span>
                  <span className="min-w-0 flex-1 pt-1.5 leading-snug break-words">{row.label}</span>
                </>
              );
              return row.href ? (
                <a
                  key={row.label}
                  href={row.href}
                  className="group flex min-w-0 items-start gap-3 rounded-lg text-sm text-text-secondary transition-colors duration-[250ms] hover:text-blush-hover"
                >
                  {content}
                </a>
              ) : (
                <span
                  key={row.label}
                  className="group flex min-w-0 items-start gap-3 text-sm text-text-secondary"
                >
                  {content}
                </span>
              );
            })}
          </div>
        </div>

        {/* Newsletter — presented as its own elevated card so it reads as a
            distinct CTA rather than "just another footer column". */}
        <div className="col-span-2 lg:col-span-1 lg:pl-10">
          <div className="flex flex-col gap-4 rounded-card bg-background p-5 shadow-soft sm:max-w-sm lg:max-w-none">
            <SectionHeading>Newsletter</SectionHeading>
            <p className="text-sm text-text-muted">
              Subscribe for new arrivals and exclusive offers.
            </p>
            <NewsletterForm variant="stacked" />
          </div>
        </div>
      </Container>

      <div className="border-t border-divider py-6">
        <Container>
          <p className="text-center text-sm tracking-[0.2px] text-text-muted">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
        </Container>
      </div>
    </footer>
  );
}
