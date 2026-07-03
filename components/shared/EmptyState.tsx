import type { LucideIcon } from "lucide-react";
import { PackageOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = PackageOpen,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-card bg-bg-dashboard px-6 py-16 text-center",
        className
      )}
    >
      <div className="flex size-16 items-center justify-center rounded-full bg-blush-light">
        <Icon className="size-8 text-blush" aria-hidden="true" />
      </div>
      <h3 className="font-heading text-xl font-semibold text-text-primary">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm leading-[160%] text-text-secondary">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
