import type { Metadata } from "next";
import {
  BadgePercent,
  BarChart3,
  Image as ImageIcon,
  LayoutGrid,
  MessageSquareText,
  Package,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/card";
import { UserRole } from "@/constants/roles";
import { requireRole } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Manage the MoonKart store.",
};

const managementAreas = [
  { label: "Products", icon: Package, description: "Add, edit, and publish products." },
  { label: "Categories", icon: LayoutGrid, description: "Organize the product catalog." },
  { label: "Orders", icon: ShoppingCart, description: "Track and fulfill customer orders." },
  { label: "Coupons", icon: BadgePercent, description: "Create and manage discount codes." },
  { label: "Banners", icon: ImageIcon, description: "Schedule homepage and promo banners." },
  { label: "Customers", icon: Users, description: "View and manage customer accounts." },
  { label: "Reviews", icon: MessageSquareText, description: "Moderate product reviews." },
  { label: "Analytics", icon: BarChart3, description: "Sales, revenue, and traffic reports." },
  { label: "Settings", icon: Settings, description: "Configure store-wide settings." },
];

export default async function AdminDashboardPage() {
  const user = await requireRole([UserRole.ADMIN]);

  return (
    <Container className="flex flex-col gap-8 py-12 sm:py-16">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-[32px]">
          Welcome back, {user.firstName}
        </h1>
        <p className="text-base text-text-secondary">
          Manage every part of the MoonKart store from here.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {managementAreas.map((area) => (
          <Card key={area.label} className="flex flex-col gap-3 p-6 opacity-60">
            <div className="flex size-11 items-center justify-center rounded-full bg-blush-light">
              <area.icon className="size-5 text-blush-hover" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-base font-semibold text-text-primary">
                  {area.label}
                </h2>
                <span className="rounded-full bg-bg-section px-2 py-0.5 text-xs font-medium text-text-muted">
                  Coming soon
                </span>
              </div>
              <p className="text-sm text-text-muted">{area.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </Container>
  );
}
