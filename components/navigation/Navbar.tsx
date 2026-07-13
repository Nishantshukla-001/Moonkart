"use client";

import { ChevronDown, Heart, LogOut, Menu, Ribbon, Search, ShieldCheck, ShoppingBag, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import logo from "@/assets/logo.jpeg";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Container } from "@/components/layout/Container";
import { SearchBar } from "@/components/shared/SearchBar";
import { UserRole } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import { siteConfig } from "@/constants/config";
import { UserMenu } from "@/features/auth/components/UserMenu";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import type { ICategory } from "@/types/product";

/** Simple link items in the centered nav — label + destination, same route constants used everywhere else. */
const primaryNavLinks = [
  { label: "Home", href: ROUTES.home },
  { label: "All Products", href: ROUTES.products },
  { label: "About Us", href: ROUTES.about },
  { label: "Return & Refund Policy", href: ROUTES.returnPolicy },
  { label: "Contact Us", href: ROUTES.contact },
];

/** Soft, understated hover — a thin underline eases in under the label instead of a hard color snap. */
const navLinkClass =
  "relative whitespace-nowrap font-heading text-sm font-medium tracking-[0.3px] text-text-primary transition-colors duration-300 after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-blush-hover after:transition-all after:duration-300 hover:text-blush-hover hover:after:w-full";

export function Navbar({ categories }: { categories: ICategory[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { profile, signOut } = useAuth();
  const itemCount = useCart((state) => state.itemCount);
  const setDrawerOpen = useCart((state) => state.setDrawerOpen);
  const router = useRouter();

  async function handleMobileSignOut() {
    await signOut();
    toast.success("Logged out.");
    setMobileOpen(false);
  }

  function handleSearch(query: string) {
    if (!query) return;
    setMobileOpen(false);
    setSearchOpen(false);
    router.push(`${ROUTES.search}?q=${encodeURIComponent(query)}`);
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-light/70 bg-background/90 shadow-soft backdrop-blur-md">
      <Container className="relative flex h-24 items-center justify-between gap-4 py-3 lg:px-8 xl:px-10">
        {/* Logo — left, generously spaced from everything else. */}
        <Link
          href={ROUTES.home}
          className="flex shrink-0 items-center gap-3"
          aria-label={`${siteConfig.name} home`}
        >
          <span className="relative flex size-11 shrink-0 items-center justify-center">
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full border-2 border-dashed border-blush-hover/50"
            />
            <Image
              src={logo}
              alt={siteConfig.name}
              width={36}
              height={36}
              className="rounded-full object-cover shadow-soft"
              priority
            />
            <Ribbon aria-hidden="true" className="absolute -top-1 -right-1 size-4 rotate-12 text-blush-hover" />
          </span>
          {/* Hidden below 400px — logo mark + icon cluster don't fit alongside
              the full wordmark at the smallest supported widths (320–390px). */}
          <span className="hidden font-heading text-lg font-bold tracking-[0.2px] text-text-primary min-[400px]:inline">
            {siteConfig.name}
          </span>
        </Link>

        {/* Centered nav — absolutely positioned so it stays truly centered on
            the header regardless of how wide the logo or icon cluster are. */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 xl:flex">
          <Link href={primaryNavLinks[0].href} className={navLinkClass}>
            {primaryNavLinks[0].label}
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className={cn(navLinkClass, "flex items-center gap-1 outline-none")}>
              Explore
              <ChevronDown className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-56">
              {categories.map((category) => (
                <DropdownMenuItem
                  key={category.slug}
                  render={<Link href={ROUTES.category(category.slug)} />}
                >
                  {category.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {primaryNavLinks.slice(1).map((link) => (
            <Link key={link.href} href={link.href} className={navLinkClass}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Icon cluster — far right, small and unobtrusive. */}
        <div className="ml-auto flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={searchOpen ? "Close search" : "Search"}
            aria-expanded={searchOpen}
            className="hover:text-blush-hover"
            onClick={() => setSearchOpen((open) => !open)}
          >
            {searchOpen ? <X /> : <Search />}
          </Button>
          <UserMenu />
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Wishlist"
            className="hover:text-blush"
            render={<Link href={ROUTES.wishlist} />}
          >
            <Heart />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Cart${itemCount > 0 ? ` (${itemCount} items)` : ""}`}
            className="relative hover:text-blush-hover"
            onClick={() => setDrawerOpen(true)}
          >
            <ShoppingBag />
            {itemCount > 0 && (
              <span className="absolute top-0.5 right-0.5 flex size-4 items-center justify-center rounded-full bg-blush-hover text-[10px] font-semibold text-text-primary">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </Button>
          {profile && <NotificationBell />}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon-sm" className="xl:hidden" aria-label="Open menu" />
              }
            >
              <Menu />
            </SheetTrigger>
            <SheetContent side="left" className="w-4/5 sm:max-w-xs">
              <SheetHeader>
                <SheetTitle>{siteConfig.name}</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 px-4">
                <SearchBar onSearch={handleSearch} />
                <nav className="flex flex-col gap-1">
                  {primaryNavLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-lg px-3 py-2.5 font-heading text-base font-medium text-text-primary transition-colors duration-[250ms] hover:bg-blush-light"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <span className="px-3 pt-3 pb-1 text-xs font-semibold tracking-wide text-text-muted uppercase">
                    Explore
                  </span>
                  {categories.map((category) => (
                    <Link
                      key={category.slug}
                      href={ROUTES.category(category.slug)}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-lg px-3 py-2.5 font-heading text-base font-medium text-text-primary transition-colors duration-[250ms] hover:bg-blush-light"
                    >
                      {category.name}
                    </Link>
                  ))}
                </nav>
                {profile ? (
                  <div className="flex flex-col gap-1 border-t border-border-light pt-3">
                    <p className="px-3 pb-1 font-heading text-sm font-semibold text-text-primary">
                      {profile.firstName} {profile.lastName}
                    </p>
                    <Link
                      href={ROUTES.account}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 font-heading text-base font-medium text-text-primary transition-colors duration-[250ms] hover:bg-blush-light"
                    >
                      <User className="size-4" /> My Account
                    </Link>
                    {profile.role === UserRole.ADMIN && (
                      <Link
                        href={ROUTES.admin}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2.5 font-heading text-base font-medium text-text-primary transition-colors duration-[250ms] hover:bg-blush-light"
                      >
                        <ShieldCheck className="size-4" /> Admin Dashboard
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={handleMobileSignOut}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left font-heading text-base font-medium text-danger transition-colors duration-[250ms] hover:bg-danger/10"
                    >
                      <LogOut className="size-4" /> Logout
                    </button>
                  </div>
                ) : (
                  <Button
                    variant="default"
                    onClick={() => setMobileOpen(false)}
                    render={<Link href={ROUTES.login} />}
                  >
                    <User />
                    Login
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </Container>

      {/* Search icon opens this panel instead of a permanently-visible input
          — the SearchBar itself is untouched, just relocated behind a toggle. */}
      {searchOpen && (
        <div className="border-t border-border-light/70 bg-background/95 backdrop-blur-md">
          <Container className="py-4 lg:px-8 xl:px-10">
            <SearchBar className="mx-auto max-w-xl" onSearch={handleSearch} />
          </Container>
        </div>
      )}
    </header>
  );
}
