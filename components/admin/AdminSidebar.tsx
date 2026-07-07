import Image from "next/image";
import Link from "next/link";

import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";
import { ROUTES } from "@/constants/routes";
import { siteConfig } from "@/constants/config";
import logo from "@/assets/logo.jpeg";

export function AdminSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <Link href={ROUTES.adminDashboard} className="flex h-20 shrink-0 items-center gap-2 px-5">
        <Image
          src={logo}
          alt={siteConfig.name}
          width={40}
          height={40}
          className="rounded-full object-cover shadow-soft"
        />
        <div className="flex flex-col leading-tight">
          <span className="font-heading text-lg font-bold text-sidebar-foreground">{siteConfig.name}</span>
          <span className="text-xs font-medium tracking-wide text-sidebar-foreground/60 uppercase">Admin</span>
        </div>
      </Link>

      <AdminSidebarNav />

      <div className="border-t border-sidebar-border p-4">
        <Link
          href={ROUTES.home}
          className="text-xs font-medium text-sidebar-foreground/60 transition-colors hover:text-sidebar-foreground"
        >
          ← Back to storefront
        </Link>
      </div>
    </aside>
  );
}
