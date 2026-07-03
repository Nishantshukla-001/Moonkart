"use client";

import { ChevronDown, Heart, LogOut, Menu, ShieldCheck, ShoppingBag, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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
import { useAuth } from "@/hooks/useAuth";
import { categories } from "@/lib/placeholderData";

const primaryNavLinks = [
  { label: "Home", href: ROUTES.home },
  { label: "Products", href: ROUTES.products },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { profile, signOut } = useAuth();

  async function handleMobileSignOut() {
    await signOut();
    toast.success("Logged out.");
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-light/80 bg-background/85 shadow-soft backdrop-blur-md">
      <Container className="flex h-20 items-center gap-4 py-3">
        <Link
          href={ROUTES.home}
          className="flex shrink-0 items-center gap-2"
          aria-label={`${siteConfig.name} home`}
        >
          <Image
            src={logo}
            alt={siteConfig.name}
            width={44}
            height={44}
            className="rounded-full object-cover shadow-soft"
            priority
          />
          <span className="font-heading text-xl font-bold text-text-primary">
            {siteConfig.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {primaryNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-heading text-base font-medium tracking-[0.2px] text-text-primary transition-colors duration-[250ms] hover:text-blush-hover"
            >
              {link.label}
            </Link>
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 font-heading text-base font-medium tracking-[0.2px] text-text-primary outline-none transition-colors duration-[250ms] hover:text-blush-hover">
              Categories
              <ChevronDown className="size-4" />
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
        </nav>

        <div className="hidden flex-1 md:block">
          <SearchBar className="max-w-md" />
        </div>

        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Wishlist"
            className="hover:text-blush"
            render={<Link href={ROUTES.wishlist} />}
          >
            <Heart />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Cart"
            className="hover:text-blush-hover"
            render={<Link href={ROUTES.cart} />}
          >
            <ShoppingBag />
          </Button>
          <UserMenu />

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu" />
              }
            >
              <Menu />
            </SheetTrigger>
            <SheetContent side="left" className="w-4/5 sm:max-w-xs">
              <SheetHeader>
                <SheetTitle>{siteConfig.name}</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 px-4">
                <SearchBar />
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
                    Categories
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
    </header>
  );
}
