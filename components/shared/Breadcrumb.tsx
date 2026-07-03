import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-text-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <Fragment key={`${item.label}-${index}`}>
              <li>
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="transition-colors duration-[250ms] hover:text-blush-hover"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    aria-current={isLast ? "page" : undefined}
                    className={isLast ? "text-text-primary" : undefined}
                  >
                    {item.label}
                  </span>
                )}
              </li>
              {!isLast && <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
