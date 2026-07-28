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

// Mobile drawer only: Home/All Products stay above "Explore", the rest move
// below the category list (client request) — desktop nav still maps
// primaryNavLinks directly and is unaffected by this split.
const mobileTopLinks = primaryNavLinks.slice(0, 2);
const mobileBottomLinks = primaryNavLinks.slice(2);

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
      <Container className="relative flex h-28 items-center justify-between gap-0.5 px-1.5 py-3 sm:h-24 sm:gap-4 sm:px-6 lg:px-8 xl:px-10">
        {/* Logo — left, generously spaced from everything else. Slightly
            larger on mobile only (size-[52px]/size-[42px] vs. the sm:+
            size-11/size-9 that reproduces the original, unchanged desktop
            size) so the mark reads clearly at the smallest widths. Wishlist
            and Cart move into the mobile sidebar (below) instead of the
            header icon row, which frees enough width for "MOONKART" to
            always render in full — `shrink-0` here means the logo+text
            group never shrinks or truncates. */}
        <Link
          href={ROUTES.home}
          className="flex shrink-0 items-center gap-0.5 sm:gap-3"
          aria-label={`${siteConfig.name} home`}
        >
          <span className="relative flex size-[52px] shrink-0 items-center justify-center sm:size-11">
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full border-2 border-dashed border-blush-hover/50"
            />
            <Image
              src={logo}
              alt={siteConfig.name}
              width={36}
              height={36}
              className="size-[42px] rounded-full object-cover shadow-soft sm:size-9"
              priority
            />
            <Ribbon aria-hidden="true" className="absolute -top-1 -right-1 size-4 rotate-12 text-blush-hover" />
          </span>
          {/* Always visible on mobile (previously hidden below 400px) and
              uppercased there to read as a compact wordmark next to the
              now-larger logo — sm: and up reverts to the exact original
              behavior (mixed-case) at every wider breakpoint. Never
              truncated — `whitespace-nowrap` just guards against wrapping
              to a second line. */}
          <span className="font-heading text-lg font-bold whitespace-nowrap tracking-normal text-text-primary uppercase sm:tracking-[0.2px] sm:normal-case">
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
            <DropdownMenuTrigger
              className={cn(navLinkClass, "flex items-center gap-1 rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50")}
            >
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

        {/* Icon cluster — far right, small and unobtrusive. `shrink-0` keeps
            every icon (including the avatar/notification bell that only
            appear once signed in) fully visible and correctly sized; the
            logo/text group on the left is what gives up space instead.
            Wishlist and Cart are hidden below `sm` — they move into the
            mobile sidebar instead (see the Sheet content below) — and are
            unchanged (still shown here) from `sm` up. */}
        <div className="ml-auto flex shrink-0 items-center gap-0 sm:gap-0.5">
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
            className="hidden hover:text-blush sm:inline-flex"
            render={<Link href={ROUTES.wishlist} />}
          >
            <Heart />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Cart${itemCount > 0 ? ` (${itemCount} items)` : ""}`}
            className="relative hidden hover:text-blush-hover sm:inline-flex"
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
                  {/* Wishlist and Cart live here instead of the mobile header's
                      icon row (hidden there below `sm` — see the icon cluster
                      above) so the header has room for the full "MOONKART"
                      wordmark. Desktop/tablet keep both in the header, unchanged. */}
                  <Link
                    href={ROUTES.wishlist}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 font-heading text-base font-medium text-text-primary transition-colors duration-[250ms] hover:bg-blush-light"
                  >
                    <Heart className="size-4" /> Wishlist
                  </Link>
                  <Link
                    href={ROUTES.cart}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 font-heading text-base font-medium text-text-primary transition-colors duration-[250ms] hover:bg-blush-light"
                  >
                    <ShoppingBag className="size-4" />
                    Cart{itemCount > 0 ? ` (${itemCount > 9 ? "9+" : itemCount})` : ""}
                  </Link>
                  {/* Home / All Products stay above Explore; About Us, Return &
                      Refund Policy, and Contact Us move below the category
                      list per client request — desktop nav order (primaryNavLinks
                      itself) is untouched. */}
                  {mobileTopLinks.map((link) => (
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
                  {mobileBottomLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-lg px-3 py-2.5 font-heading text-base font-medium text-text-primary transition-colors duration-[250ms] hover:bg-blush-light"
                    >
                      {link.label}
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
