import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarProps {
  items: SidebarItem[];
  activeHref: string;
  className?: string;
}

export function Sidebar({ items, activeHref, className }: SidebarProps) {
  return (
    <nav
      className={cn(
        "flex w-full flex-col gap-1 rounded-card bg-background p-3 shadow-sm md:w-64",
        className
      )}
    >
      {items.map((item) => {
        const isActive = item.href === activeHref;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 font-heading text-sm font-medium transition-colors duration-[250ms]",
              isActive
                ? "bg-blush text-text-primary"
                : "text-text-secondary hover:bg-blush-light hover:text-text-primary"
            )}
          >
            <Icon className="size-5 shrink-0" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
