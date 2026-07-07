import type { LucideIcon } from "lucide-react";

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-border-medium bg-bg-section/50 px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-blush-light">
        <Icon className="size-5 text-blush-hover" aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-heading text-base font-semibold text-text-primary">{title}</h3>
        <p className="max-w-sm text-sm text-text-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}
