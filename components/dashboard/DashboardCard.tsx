import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  className?: string;
}

export function DashboardCard({ label, value, icon: Icon, className }: DashboardCardProps) {
  return (
    <Card className={cn("flex flex-row items-center justify-between p-5", className)}>
      <div className="flex flex-col gap-1">
        <span className="text-base font-medium text-text-secondary">{label}</span>
        <span className="font-heading text-[34px] leading-none font-bold text-text-primary">
          {value}
        </span>
      </div>
      {Icon && (
        <div className="flex size-11 items-center justify-center rounded-full bg-blush-light">
          <Icon className="size-6 text-blush" aria-hidden="true" />
        </div>
      )}
    </Card>
  );
}
