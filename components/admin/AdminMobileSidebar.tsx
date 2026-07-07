"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";

import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ROUTES } from "@/constants/routes";
import { siteConfig } from "@/constants/config";
import logo from "@/assets/logo.jpeg";

export function AdminMobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open admin menu"
      >
        <Menu />
      </Button>
      <SheetContent side="left" className="w-72 bg-sidebar p-0">
        <SheetHeader className="flex-row items-center gap-2 border-b border-sidebar-border p-4">
          <Link href={ROUTES.adminDashboard} className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <Image src={logo} alt={siteConfig.name} width={36} height={36} className="rounded-full object-cover" />
            <SheetTitle className="font-heading text-base font-bold text-sidebar-foreground">
              {siteConfig.name} Admin
            </SheetTitle>
          </Link>
        </SheetHeader>
        <AdminSidebarNav onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
