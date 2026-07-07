"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ADMIN_NAV_LINKS } from "@/components/admin/adminNavLinks";
import { cn } from "@/lib/utils";

export function AdminSidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
      {ADMIN_NAV_LINKS.map((link) => {
        const isActive =
          pathname === link.href || (link.href !== "/admin/dashboard" && pathname?.startsWith(`${link.href}/`));

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors",
              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isActive && "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft hover:bg-sidebar-primary"
            )}
          >
            <link.icon className="size-[18px] shrink-0" aria-hidden="true" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
