import type { Metadata } from "next";
import Link from "next/link";
import { Heart, MapPin, Package, ShieldCheck, User as UserIcon } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/card";
import { UserRole } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "My Account",
  description: "Your MoonKart account dashboard.",
};

const availableLinks = [
  {
    label: "Profile",
    href: ROUTES.profile,
    icon: UserIcon,
    description: "Update your personal details and password.",
  },
];

const comingSoon = [
  { label: "My Orders", icon: Package, description: "Track and manage your orders." },
  { label: "Wishlist", icon: Heart, description: "Items you're saving for later." },
  { label: "Addresses", icon: MapPin, description: "Manage your delivery addresses." },
];

export default async function AccountPage() {
  const user = await requireUser();

  return (
    <Container className="flex flex-col gap-8 py-12 sm:py-16">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-[32px]">
          Welcome back, {user.firstName}
        </h1>
        <p className="text-base text-text-secondary">Here&apos;s a quick look at your account.</p>
      </div>

      {user.role === UserRole.ADMIN && (
        <Card className="flex items-center gap-4 border-blush/40 bg-blush-light/40 p-5">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-blush">
            <ShieldCheck className="size-5 text-text-primary" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h2 className="font-heading text-base font-semibold text-text-primary">
              Admin Dashboard
            </h2>
            <p className="text-sm text-text-muted">Manage products, orders, and the entire store.</p>
          </div>
          <Link
            href={ROUTES.admin}
            className="shrink-0 text-sm font-semibold text-blush-hover hover:text-text-primary"
          >
            Go to Dashboard →
          </Link>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {availableLinks.map((link) => (
          <Card
            key={link.href}
            className="group p-6 transition-all duration-[250ms] hover:-translate-y-1 hover:shadow-soft-lg"
          >
            <Link href={link.href} className="flex flex-col gap-3">
              <div className="flex size-11 items-center justify-center rounded-full bg-blush-light">
                <link.icon className="size-5 text-blush-hover" aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-heading text-base font-semibold text-text-primary">
                  {link.label}
                </h2>
                <p className="text-sm text-text-muted">{link.description}</p>
              </div>
            </Link>
          </Card>
        ))}

        {comingSoon.map((item) => (
          <Card key={item.label} className="flex flex-col gap-3 p-6 opacity-60">
            <div className="flex size-11 items-center justify-center rounded-full bg-bg-section">
              <item.icon className="size-5 text-text-muted" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-base font-semibold text-text-primary">
                  {item.label}
                </h2>
                <span className="rounded-full bg-bg-section px-2 py-0.5 text-xs font-medium text-text-muted">
                  Coming soon
                </span>
              </div>
              <p className="text-sm text-text-muted">{item.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </Container>
  );
}
