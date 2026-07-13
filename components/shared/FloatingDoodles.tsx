import { Flower2, Heart, Ribbon, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

const doodles = [
  { Icon: Heart, className: "top-[6%] left-[3%] size-8 -rotate-12 text-blush-hover/80 sm:size-9" },
  { Icon: Flower2, className: "top-[10%] right-[4%] size-9 rotate-6 text-sage-hover/70 sm:size-10" },
  { Icon: Ribbon, className: "top-1/2 left-[1%] size-7 -translate-y-1/2 rotate-12 text-blush/80 hidden sm:block" },
  { Icon: Sparkles, className: "top-[40%] right-[2%] size-6 -rotate-6 text-warm-yellow sm:size-7" },
  { Icon: Heart, className: "bottom-[8%] right-[6%] size-7 rotate-12 text-blush-hover/70 sm:size-8" },
  { Icon: Flower2, className: "bottom-[12%] left-[5%] size-8 -rotate-6 text-sage-hover/70 sm:size-9" },
  { Icon: Sparkles, className: "bottom-[30%] left-[14%] size-5 rotate-12 text-blush/90 hidden md:block" },
  { Icon: Ribbon, className: "top-[16%] right-[18%] size-6 rotate-[20deg] text-blush-hover/60 hidden md:block" },
] as const;

/**
 * Purely decorative scattered accents — dropped into any `relative` section
 * wrapper to give the page its "kawaii sticker" feel. `pointer-events-none`
 * and `aria-hidden` throughout, so it can never affect layout, interaction,
 * or screen-reader output for the real content it sits behind.
 */
export function FloatingDoodles({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {doodles.map(({ Icon, className: iconClassName }, index) => (
        <Icon key={index} className={cn("absolute drop-shadow-sm", iconClassName)} />
      ))}
    </div>
  );
}
