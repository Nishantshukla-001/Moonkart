import Image from "next/image";
import Link from "next/link";

import logo from "@/assets/logo.jpeg";
import { Container } from "@/components/layout/Container";
import { ROUTES } from "@/constants/routes";
import { siteConfig } from "@/constants/config";

interface AuthCardProps {
  heading: string;
  subheading?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/** Shared centered-card shell for every /auth/* page. */
export function AuthCard({ heading, subheading, children, footer }: AuthCardProps) {
  return (
    <div className="bg-gradient-to-br from-blush-light/60 via-background to-blush/10 py-16 sm:py-20">
      <Container className="flex justify-center">
        <div className="w-full max-w-md rounded-card bg-background p-8 shadow-soft-lg sm:p-10">
          <Link
            href={ROUTES.home}
            className="mb-6 flex items-center justify-center gap-2.5"
          >
            <Image
              src={logo}
              alt={siteConfig.name}
              width={40}
              height={40}
              className="rounded-full object-cover shadow-soft"
            />
            <span className="font-heading text-xl font-bold text-text-primary">
              {siteConfig.name}
            </span>
          </Link>

          <div className="mb-8 flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-[28px]">
              {heading}
            </h1>
            {subheading && <p className="text-sm text-text-secondary">{subheading}</p>}
          </div>

          {children}

          {footer && <div className="mt-6 text-center text-sm text-text-secondary">{footer}</div>}
        </div>
      </Container>
    </div>
  );
}
