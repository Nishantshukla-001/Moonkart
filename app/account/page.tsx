import type { Metadata } from "next";
import Link from "next/link";
import {
  Heart,
  MapPin,
  Package,
  ShieldCheck,
  User as UserIcon,
  Wallet,
} from "lucide-react";

import { Carousel } from "@/components/shared/Carousel";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/card";
import { UserRole } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import { getAccountStats } from "@/features/account/services/account.service";
import { AddressCard } from "@/features/addresses/components/AddressCard";
import { getAddresses } from "@/features/addresses/services/address.service";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { getOrdersForUser } from "@/features/orders/services/order.service";
import { ProductCardConnected } from "@/features/products/components/ProductCardConnected";
import { RecentlyViewedSection } from "@/features/products/components/RecentlyViewedSection";
import { getFeaturedProducts } from "@/features/products/services/product.service";
import { requireUser } from "@/lib/auth";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";

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
  {
    label: "My Orders",
    href: ROUTES.orders,
    icon: Package,
    description: "Track and manage your orders.",
  },
  {
    label: "Wishlist",
    href: ROUTES.wishlist,
    icon: Heart,
    description: "Items you're saving for later.",
  },
  {
    label: "Addresses",
    href: ROUTES.addresses,
    icon: MapPin,
    description: "Manage your delivery addresses.",
  },
];

export default async function AccountPage() {
  const user = await requireUser();

  const [stats, addresses, recentOrders, recommended] = await Promise.all([
    getAccountStats(user.id),
    getAddresses(user.id),
    getOrdersForUser(user.id, 1, 3),
    getFeaturedProducts(4),
  ]);

  const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0] ?? null;

  const statCards = [
    { label: "Total Orders", value: String(stats.totalOrders), icon: Package },
    { label: "Total Spent", value: formatCurrency(stats.totalSpent), icon: Wallet },
    { label: "Wishlist Items", value: String(stats.wishlistCount), icon: Heart },
    { label: "Favourite Category", value: stats.favouriteCategory ?? "—", icon: MapPin },
  ];

  return (
    <>
    <Container className="flex flex-col gap-8 py-12 sm:py-16">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-[32px]">
          Welcome back, {user.firstName}
        </h1>
        <p className="text-base text-text-secondary">
          Member since {formatDate(stats.memberSince)}
          {stats.lastLogin && ` · Last login ${formatDate(stats.lastLogin)}`}
        </p>
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="flex items-center gap-4 p-5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-blush-light">
              <stat.icon className="size-5 text-blush-hover" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-bold text-text-primary">{stat.value}</p>
              <p className="text-xs text-text-muted">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

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
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-0 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-divider p-5">
            <h2 className="font-heading text-base font-semibold text-text-primary">Recent Orders</h2>
            <Link href={ROUTES.orders} className="text-sm font-semibold text-blush-hover hover:text-text-primary">
              View all →
            </Link>
          </div>
          {recentOrders.items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-10 text-center">
              <Package className="size-8 text-text-muted" aria-hidden="true" />
              <p className="text-sm text-text-muted">You haven&apos;t placed any orders yet.</p>
              <Link href={ROUTES.products} className="text-sm font-semibold text-blush-hover hover:text-text-primary">
                Start shopping →
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-divider">
              {recentOrders.items.map((order) => (
                <li key={order.id}>
                  <Link
                    href={ROUTES.order(order.id)}
                    className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-bg-section/50"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-text-primary">{order.orderNumber}</p>
                      <p className="text-xs text-text-muted">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-text-primary">
                        {formatCurrency(order.totalAmount)}
                      </span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-0">
          <div className="flex items-center justify-between border-b border-divider p-5">
            <h2 className="font-heading text-base font-semibold text-text-primary">Default Address</h2>
            <MapPin className="size-4 text-blush-hover" aria-hidden="true" />
          </div>
          <div className="p-4">
            {defaultAddress ? (
              <AddressCard address={defaultAddress} />
            ) : (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <p className="text-sm text-text-muted">No saved addresses yet.</p>
                <Link
                  href={ROUTES.addresses}
                  className="text-sm font-semibold text-blush-hover hover:text-text-primary"
                >
                  Add an address →
                </Link>
              </div>
            )}
          </div>
        </Card>
      </div>

    </Container>

    {recommended.length > 0 && (
      <Carousel title="Recommended For You" viewAllHref={ROUTES.products} ariaLabel="Recommended For You">
        {recommended.map((product) => (
          <ProductCardConnected key={product.id} product={product} />
        ))}
      </Carousel>
    )}

    <RecentlyViewedSection />
    </>
  );
}
