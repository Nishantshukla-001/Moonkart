import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AdminStatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  href?: string;
  tone?: "default" | "warning" | "danger";
  comingSoon?: boolean;
}

const toneStyles: Record<NonNullable<AdminStatCardProps["tone"]>, string> = {
  default: "bg-blush-light text-blush-hover",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
};

export function AdminStatCard({ label, value, icon: Icon, href, tone = "default", comingSoon }: AdminStatCardProps) {
  const content = (
    <Card
      className={cn(
        "flex items-center gap-4 p-5",
        href && "transition-all duration-[250ms] hover:-translate-y-0.5 hover:shadow-soft-lg",
        comingSoon && "opacity-60"
      )}
    >
      <div className={cn("flex size-12 shrink-0 items-center justify-center rounded-full", toneStyles[tone])}>
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <div className="flex flex-col">
        <span className="font-heading text-2xl font-bold text-text-primary">{value}</span>
        <span className="flex items-center gap-1.5 text-sm text-text-muted">
          {label}
          {comingSoon && (
            <span className="rounded-full bg-bg-section px-1.5 py-0.5 text-[10px] font-medium text-text-muted">
              Soon
            </span>
          )}
        </span>
      </div>
    </Card>
  );

  if (href && !comingSoon) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
