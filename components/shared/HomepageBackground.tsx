import {
  BowDoodle,
  FlowerDoodle,
  HeartDoodle,
  LeafDoodle,
  SparkleDoodle,
  StarDoodle,
} from "@/components/shared/decorations/DecorativeIcons";
import { WatercolorBlob } from "@/components/shared/decorations/WatercolorBlob";
import { cn } from "@/lib/utils";

// Scattered once across the whole page (by percentage, so it scales with
// however tall the rendered content ends up being) instead of once per
// section — this is what keeps every decorative element inside a single,
// explicitly-below-content stacking layer (see the z-index note below).
const doodles = [
  { Icon: HeartDoodle, className: "top-[3%] left-[4%] size-7 -rotate-12 text-blush-hover/70" },
  { Icon: BowDoodle, className: "top-[5%] right-[7%] size-8 rotate-12 text-blush-hover/70 hidden sm:block" },
  { Icon: SparkleDoodle, className: "top-[13%] left-[2%] size-6 text-warm-yellow hidden sm:block" },
  { Icon: FlowerDoodle, className: "top-[24%] right-[4%] size-8 rotate-6 text-sage-hover/60" },
  { Icon: StarDoodle, className: "top-[33%] left-[8%] size-6 -rotate-6 text-blush-hover/60 hidden md:block" },
  { Icon: LeafDoodle, className: "top-[44%] right-[3%] size-7 rotate-12 text-sage-hover/60 hidden sm:block" },
  { Icon: HeartDoodle, className: "top-[54%] left-[3%] size-6 rotate-12 text-blush/80" },
  { Icon: SparkleDoodle, className: "top-[63%] right-[6%] size-6 text-warm-yellow hidden sm:block" },
  { Icon: BowDoodle, className: "top-[73%] left-[6%] size-7 -rotate-6 text-blush-hover/70 hidden md:block" },
  { Icon: FlowerDoodle, className: "top-[84%] right-[5%] size-7 rotate-6 text-sage-hover/60" },
  { Icon: StarDoodle, className: "top-[93%] left-[10%] size-6 rotate-12 text-blush-hover/60 hidden sm:block" },
] as const;

/**
 * ONE global decorative layer for the entire homepage — the pastel gradient
 * wash, the watercolor blobs, and every doodle icon all live here, rendered
 * exactly once behind all homepage content (see app/page.tsx). Purely
 * decorative: `pointer-events-none` and `aria-hidden` throughout.
 *
 * Explicit `z-0` (not a bare `absolute inset-0` with no z-index) is what
 * fixes the earlier rendering bug — a `position: absolute` element with no
 * z-index is still a *positioned* element, and positioned elements paint
 * *after* normal-flow content within the same stacking context. Scattered
 * one per section, that meant every decorative layer rendered on top of
 * that section's cards/text instead of behind it. A single global layer
 * with `z-0`, paired with the content wrapper's explicit `z-10`, guarantees
 * the background always paints first regardless of DOM position.
 */
export function HomepageBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg," +
          " var(--sage-light) 0%," +
          " var(--bg-section) 9%," +
          " var(--blush-light) 20%," +
          " color-mix(in srgb, var(--blush) 55%, var(--warm-yellow) 45%) 33%," +
          " var(--bg-section) 45%," +
          " var(--sage-light) 57%," +
          " var(--warm-yellow) 70%," +
          " var(--blush-light) 83%," +
          " var(--bg-section) 100%)",
      }}
    >
      <WatercolorBlob variant="a" className="absolute top-[-6%] left-[-14%] size-[30rem] text-sage-hover/25 blur-3xl sm:size-[38rem]" />
      <WatercolorBlob variant="b" className="absolute top-[6%] right-[-16%] size-[26rem] text-blush-hover/25 blur-3xl sm:size-[34rem]" />
      <WatercolorBlob variant="c" className="absolute top-[24%] left-[-10%] size-[24rem] text-blush/30 blur-3xl sm:size-[30rem]" />
      <WatercolorBlob variant="a" className="absolute top-[40%] right-[-12%] size-[26rem] text-warm-yellow/35 blur-3xl sm:size-[32rem]" />
      <WatercolorBlob variant="b" className="absolute top-[58%] left-[-16%] size-[28rem] text-sage-hover/25 blur-3xl sm:size-[36rem]" />
      <WatercolorBlob variant="c" className="absolute top-[74%] right-[-14%] size-[26rem] text-blush-hover/25 blur-3xl sm:size-[34rem]" />
      <WatercolorBlob variant="a" className="absolute top-[90%] left-[-10%] size-[24rem] text-warm-yellow/30 blur-3xl sm:size-[30rem]" />

      {doodles.map(({ Icon, className }, index) => (
        <Icon key={index} className={cn("absolute drop-shadow-sm", className)} />
      ))}
    </div>
  );
}
