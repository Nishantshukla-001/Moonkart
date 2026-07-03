"use client";

import { LogOut, ShieldCheck, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserRole } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";

/** Navbar auth slot — Login button when signed out, avatar menu when signed in. */
export function UserMenu() {
  const { profile, isLoading, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (isLoading) {
    return <div className="size-9 shrink-0 animate-pulse rounded-full bg-bg-section" aria-hidden="true" />;
  }

  if (!profile) {
    return (
      <Button
        variant="secondary"
        size="sm"
        className="hidden sm:inline-flex"
        render={<Link href={ROUTES.login} />}
      >
        <UserIcon />
        Login
      </Button>
    );
  }

  async function handleSignOut() {
    setIsSigningOut(true);
    await signOut();
    toast.success("Logged out.");
    setIsSigningOut(false);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex size-9 items-center justify-center rounded-full bg-blush-light font-heading text-sm font-semibold text-blush-hover outline-none transition-transform duration-[250ms] hover:scale-105"
        aria-label="Account menu"
      >
        {profile.firstName[0]}
        {profile.lastName[0]}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <div className="px-2.5 py-2">
          <p className="font-heading text-sm font-semibold text-text-primary">
            {profile.firstName} {profile.lastName}
          </p>
          <p className="truncate text-xs text-text-muted">{profile.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href={ROUTES.account} />}>
          <UserIcon /> My Account
        </DropdownMenuItem>
        {profile.role === UserRole.ADMIN && (
          <DropdownMenuItem render={<Link href={ROUTES.admin} />}>
            <ShieldCheck /> Admin Dashboard
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} disabled={isSigningOut}>
          <LogOut /> {isSigningOut ? "Logging out..." : "Logout"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
