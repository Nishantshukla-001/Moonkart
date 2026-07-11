"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const gallery = images.length > 0 ? images : ["/icon.jpg"];
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  function measureActiveIndex() {
    const el = scrollRef.current;
    if (!el) return;
    setActiveIndex(Math.round(el.scrollLeft / Math.max(el.clientWidth, 1)));
  }

  function scrollToIndex(index: number) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  }

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const resizeObserver = new ResizeObserver(() => measureActiveIndex());
    resizeObserver.observe(el);
    return () => resizeObserver.disconnect();
  }, []);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    setZoomPosition({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={scrollRef}
        role="region"
        aria-label={`${name} image gallery`}
        onScroll={measureActiveIndex}
        className="relative flex aspect-square snap-x snap-mandatory gap-0 overflow-x-auto overscroll-x-contain touch-pan-x rounded-image bg-bg-dashboard shadow-soft [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {gallery.map((image, index) => (
          <div
            key={image + index}
            className="relative aspect-square w-full shrink-0 snap-start overflow-hidden"
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            onMouseMove={handleMouseMove}
          >
            <Image
              src={image}
              alt={index === 0 ? name : `${name} — view ${index + 1}`}
              fill
              priority={index === 0}
              draggable={false}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className={cn(
                "object-cover transition-transform duration-200 ease-out",
                isZooming && index === activeIndex && "hidden sm:block sm:scale-[2.2]"
              )}
              style={
                isZooming && index === activeIndex
                  ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` }
                  : undefined
              }
            />
          </div>
        ))}
      </div>

      {gallery.length > 1 && (
        <div className="grid grid-cols-5 gap-2.5">
          {gallery.map((image, index) => (
            <button
              key={image + index}
              type="button"
              onClick={() => scrollToIndex(index)}
              aria-label={`Show image ${index + 1}`}
              aria-current={index === activeIndex ? "true" : undefined}
              className={cn(
                "relative aspect-square overflow-hidden rounded-lg ring-2 transition-all duration-[250ms]",
                index === activeIndex ? "ring-blush-hover" : "ring-transparent hover:ring-blush/40"
              )}
            >
              <Image src={image} alt="" fill sizes="20vw" className="object-cover" draggable={false} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
