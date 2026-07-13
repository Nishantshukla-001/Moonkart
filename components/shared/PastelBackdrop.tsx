import { cn } from "@/lib/utils";

/**
 * Large, clearly-visible pastel blob wash — the "cloud collage" background
 * used behind every homepage section. Much bigger and more saturated than a
 * subtle corner accent: this is meant to actually read as colored background,
 * not a hint of one. Purely decorative (`pointer-events-none`, `aria-hidden`).
 */
export function PastelBackdrop({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      <div className="absolute -top-24 -left-32 size-[26rem] rounded-full bg-sage-light opacity-90 blur-3xl sm:size-[34rem]" />
      <div className="absolute -top-16 -right-24 size-[24rem] rounded-full bg-blush opacity-70 blur-3xl sm:size-[30rem]" />
      <div className="absolute bottom-[-8rem] left-1/4 size-[22rem] rounded-full bg-warm-yellow opacity-60 blur-3xl sm:size-[28rem]" />
      <div className="absolute right-[-6rem] bottom-[-6rem] size-[24rem] rounded-full bg-blush-hover opacity-40 blur-3xl sm:size-[30rem]" />
    </div>
  );
}
