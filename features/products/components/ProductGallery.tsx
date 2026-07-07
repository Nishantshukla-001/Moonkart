"use client";

import { useState } from "react";

import { AspectImage } from "@/components/shared/AspectImage";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const gallery = images.length > 0 ? images : ["/icon.jpg"];

  return (
    <div className="flex flex-col gap-3">
      <AspectImage
        src={gallery[activeIndex]}
        alt={name}
        ratio="square"
        rounded="rounded-image"
        className="shadow-soft"
        priority
      />

      {gallery.length > 1 && (
        <div className="grid grid-cols-5 gap-2.5">
          {gallery.map((image, index) => (
            <button
              key={image + index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show image ${index + 1}`}
              className={cn(
                "overflow-hidden rounded-lg ring-2 transition-all duration-[250ms]",
                index === activeIndex ? "ring-blush-hover" : "ring-transparent hover:ring-blush/40"
              )}
            >
              <AspectImage src={image} alt="" ratio="square" rounded="rounded-lg" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
