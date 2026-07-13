import { Quote, Star } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { Testimonial } from "@/lib/placeholderData";

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function TestimonialCard({ name, quote, rating }: Testimonial) {
  return (
    <Card className="relative flex h-full flex-col gap-4 rounded-[24px] border border-blush-light bg-blush-light/40 p-7 ring-1 ring-transparent transition-all duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 hover:bg-background hover:shadow-soft-lg hover:ring-blush-hover/30">
      <Quote className="absolute top-6 right-6 size-8 text-blush" aria-hidden="true" />
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={
              index < rating
                ? "size-4 fill-warning text-warning"
                : "size-4 text-border-medium"
            }
          />
        ))}
      </div>
      <p className="relative flex-1 text-base leading-[160%] text-text-secondary">
        &ldquo;{quote}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-blush to-blush-hover font-heading text-sm font-semibold text-text-primary shadow-soft">
          {initialsOf(name)}
        </div>
        <span className="font-heading text-sm font-semibold text-text-primary">{name}</span>
      </div>
    </Card>
  );
}
