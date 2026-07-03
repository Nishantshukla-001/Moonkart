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

export function Footer() {
  return (
    <footer className="border-t border-border-light bg-gradient-to-b from-bg-dashboard via-blush-light/20 to-bg-dashboard shadow-[0_-4px_24px_-16px_rgba(47,47,47,0.08)]">
      <div aria-hidden="true" className="h-1 bg-gradient-to-r from-blush via-blush-hover to-warm-yellow" />

      <Container className="grid grid-cols-1 gap-12 py-20 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10 lg:divide-x lg:divide-border-light/70">
        <div className="flex flex-col gap-4">
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
          <p className="text-sm leading-[170%] text-text-secondary">{siteConfig.description}</p>
          <a
            href={socialLinks.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-fit items-center gap-2 rounded-full bg-background px-3.5 py-1.5 text-sm text-text-secondary shadow-soft transition-all duration-[300ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:text-blush-hover hover:shadow-soft-md"
          >
            <InstagramIcon className="size-4" />@{socialLinks.instagram.username}
          </a>
        </div>

        <div className="flex flex-col gap-4 lg:pl-10">
          <div className="flex flex-col gap-2">
            <h3 className="font-heading text-base font-semibold tracking-[0.2px] text-text-primary">
              Quick Links
            </h3>
            <span aria-hidden="true" className="h-px w-8 bg-blush" />
          </div>
          <nav className="flex flex-col gap-3">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="w-fit text-sm text-text-muted transition-all duration-[300ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:translate-x-1 hover:text-blush-hover"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-4 lg:pl-10">
          <div className="flex flex-col gap-2">
            <h3 className="font-heading text-base font-semibold tracking-[0.2px] text-text-primary">
              Contact
            </h3>
            <span aria-hidden="true" className="h-px w-8 bg-blush" />
          </div>
          <div className="flex flex-col gap-4">
            {contactRows.map((row) => {
              const content = (
                <>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blush shadow-soft transition-transform duration-[250ms] group-hover:scale-110">
                    <row.icon className="size-4 text-text-primary" strokeWidth={2.25} />
                  </span>
                  <span className="pt-1.5 leading-snug">{row.label}</span>
                </>
              );
              return row.href ? (
                <a
                  key={row.label}
                  href={row.href}
                  className="group flex items-start gap-3 text-sm text-text-secondary transition-colors duration-[250ms] hover:text-blush-hover"
                >
                  {content}
                </a>
              ) : (
                <span key={row.label} className="group flex items-start gap-3 text-sm text-text-secondary">
                  {content}
                </span>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:pl-10">
          <div className="flex flex-col gap-2">
            <h3 className="font-heading text-base font-semibold tracking-[0.2px] text-text-primary">
              Newsletter
            </h3>
            <span aria-hidden="true" className="h-px w-8 bg-blush" />
          </div>
          <p className="text-sm text-text-muted">
            Subscribe for new arrivals and exclusive offers.
          </p>
          <NewsletterForm variant="compact" />
        </div>
      </Container>

      <div className="border-t border-divider py-6">
        <Container>
          <p className="text-center text-sm text-text-muted">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
        </Container>
      </div>
    </footer>
  );
}
