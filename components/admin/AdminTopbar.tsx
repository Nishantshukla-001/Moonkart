"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Search, Settings, ShieldCheck, User as UserIcon } from "lucide-react";

import { AdminMobileSidebar } from "@/components/admin/AdminMobileSidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import type { IUser } from "@/types/user";

export function AdminTopbar({ user }: { user: IUser }) {
  const router = useRouter();
  const { signOut } = useAuth();
  const [search, setSearch] = useState("");

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    const query = search.trim();
    router.push(query ? `${ROUTES.adminProducts}?search=${encodeURIComponent(query)}` : ROUTES.adminProducts);
  }

  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "A";

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center gap-3 border-b border-border-light bg-background/90 px-4 shadow-soft backdrop-blur-md sm:px-6 lg:px-8">
      <AdminMobileSidebar />

      <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-text-muted" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search products…"
          className="pl-10"
          aria-label="Search products"
        />
      </form>

      <div className="ml-auto flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="h-11 gap-2 px-2" />
            }
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blush text-xs font-semibold text-text-primary">
              {initials}
            </span>
            <span className="hidden flex-col items-start leading-tight sm:flex">
              <span className="text-sm font-semibold text-text-primary">{user.firstName}</span>
              <span className="text-xs text-text-muted">Administrator</span>
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col gap-0.5 px-2 py-1.5">
              <span className="text-sm font-semibold text-text-primary">
                {user.firstName} {user.lastName}
              </span>
              <span className="truncate text-xs font-normal text-text-muted">{user.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href={ROUTES.profile} />}>
              <UserIcon /> My Profile
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href={ROUTES.adminSettings} />}>
              <Settings /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href={ROUTES.home} />}>
              <ShieldCheck /> View Storefront
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => signOut()}>
              <LogOut /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
