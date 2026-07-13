"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/shared/Reveal";
import { cn } from "@/lib/utils";

interface CarouselProps {
  title: string;
  subtitle?: string;
  viewAllHref: string;
  /** Accessible name for the scrollable region, e.g. "Trending Products". */
  ariaLabel: string;
  background?: "white" | "blush" | "cream";
  /**
   * Each child becomes one carousel slide. Width/snap/shrink behavior is
   * applied here so callers (ProductSection, Featured Collections, related
   * products) only need to render their cards — no sizing classes needed
   * on the card itself.
   */
  children: React.ReactNode;
  className?: string;
  /** Optional override merged onto the `<h2>` — e.g. the homepage's gradient-text treatment. Empty by default so every other caller is unaffected. */
  headingClassName?: string;
}

export const sectionBackgrounds = {
  white: "",
  blush: "bg-blush-light/40",
  cream: "bg-bg-section",
} as const;

/**
 * Slide width per breakpoint, expressed as a percentage of the scroll
 * container so it naturally yields ~2 cards (+ a peek of the 3rd, signalling
 * swipeability) on the smallest phones, up to 5-6 on desktop — without any
 * JS measuring. Container maxes out at max-w-7xl, so these percentages also
 * cap out at a fixed pixel width beyond 1280px (1440/1920 don't grow further).
 */
const SLIDE_WIDTH_CLASS = "w-[40%] sm:w-[31%] md:w-[23%] lg:w-[18.4%] xl:w-[15.4%]";

export function Carousel({
  title,
  subtitle,
  viewAllHref,
  ariaLabel,
  background = "white",
  children,
  className,
  headingClassName,
}: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const [activePage, setActivePage] = useState(0);

  const measure = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const visible = el.clientWidth;
    const total = el.scrollWidth;
    setPageCount(Math.max(1, Math.ceil(total / Math.max(visible, 1))));
    setCanScrollPrev(el.scrollLeft > 8);
    setCanScrollNext(el.scrollLeft < total - visible - 8);
    setActivePage(Math.round(el.scrollLeft / Math.max(visible, 1)));
  }, []);

  useEffect(() => {
    measure();
    const el = scrollRef.current;
    if (!el) return;

    const resizeObserver = new ResizeObserver(() => measure());
    resizeObserver.observe(el);
    return () => resizeObserver.disconnect();
  }, [measure, children]);

  function scrollToPage(page: number) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: page * el.clientWidth, behavior: "smooth" });
  }

  function scrollByDirection(direction: 1 | -1) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth * 0.9 * direction, behavior: "smooth" });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollByDirection(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollByDirection(-1);
    }
  }

  const showArrows = canScrollPrev || canScrollNext;
  const showPagination = pageCount > 1;

  return (
    <section className={cn("py-16 sm:py-20", sectionBackgrounds[background], className)}>
      <Container>
        <Reveal className="mb-8 flex flex-col gap-2 sm:mb-10">
          <h2 className={cn("text-3xl font-bold tracking-tight text-text-primary sm:text-[32px]", headingClassName)}>
            {title}
          </h2>
          {subtitle && <p className="text-base text-text-secondary">{subtitle}</p>}
        </Reveal>

        <Reveal delay={0.1} className="overflow-hidden">
          <div
            ref={scrollRef}
            role="region"
            aria-label={`${ariaLabel} carousel`}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onScroll={measure}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain touch-pan-x scroll-smooth pb-1 outline-none select-none sm:gap-5 [-ms-overflow-style:none] [scrollbar-width:none] focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-scrollbar]:hidden"
          >
            {Array.isArray(children)
              ? children.map((child, index) => (
                  <div key={index} className={cn("flex shrink-0 snap-start", SLIDE_WIDTH_CLASS)}>
                    {child}
                  </div>
                ))
              : (
                  <div className={cn("flex shrink-0 snap-start", SLIDE_WIDTH_CLASS)}>{children}</div>
                )}
          </div>
        </Reveal>

        {(showArrows || showPagination) && (
          <div className="mt-6 flex items-center justify-center gap-3 sm:mt-8">
            <Button
              variant="outline"
              size="icon-lg"
              className={cn("hidden sm:inline-flex", !showArrows && "sm:invisible")}
              onClick={() => scrollByDirection(-1)}
              disabled={!canScrollPrev}
              aria-label={`Scroll ${title} left`}
            >
              <ChevronLeft />
            </Button>

            {showPagination && (
              <div className="flex items-center gap-2" aria-hidden={pageCount <= 1}>
                {Array.from({ length: pageCount }).map((_, page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => scrollToPage(page)}
                    aria-label={`Go to slide ${page + 1} of ${pageCount}`}
                    aria-current={page === activePage ? "true" : undefined}
                    className={cn(
                      "flex size-11 items-center justify-center",
                      "after:size-2.5 after:rounded-full after:transition-all after:duration-[250ms] after:content-['']",
                      page === activePage ? "after:w-6 after:bg-blush-hover" : "after:bg-border-medium"
                    )}
                  />
                ))}
              </div>
            )}

            <Button
              variant="outline"
              size="icon-lg"
              className={cn("hidden sm:inline-flex", !showArrows && "sm:invisible")}
              onClick={() => scrollByDirection(1)}
              disabled={!canScrollNext}
              aria-label={`Scroll ${title} right`}
            >
              <ChevronRight />
            </Button>
          </div>
        )}

        <div className="mt-6 flex justify-center sm:mt-8">
          <Button variant="outline" render={<Link href={viewAllHref} />}>
            View All
            <ArrowRight />
          </Button>
        </div>
      </Container>
    </section>
  );
}
