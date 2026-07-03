import Image, { type StaticImageData } from "next/image";

import { cn } from "@/lib/utils";

type AspectRatio = "square" | "portrait" | "landscape" | "wide";

const ratioClasses: Record<AspectRatio, string> = {
  square: "aspect-square",
  portrait: "aspect-[4/5]",
  landscape: "aspect-[4/3]",
  wide: "aspect-video",
};

interface AspectImageProps {
  src: string | StaticImageData;
  alt: string;
  ratio?: AspectRatio;
  rounded?: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
}

/**
 * Single reusable primitive for every product/category/collection/banner
 * image in the app. Enforces a fixed aspect ratio (no layout shift) and
 * object-cover fill regardless of the source image's real dimensions —
 * this is what lets placeholder images be swapped for real product photos
 * later with zero code changes.
 */
export function AspectImage({
  src,
  alt,
  ratio = "square",
  rounded = "rounded-image",
  className,
  imageClassName,
  priority,
}: AspectImageProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-bg-dashboard",
        ratioClasses[ratio],
        rounded,
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className={cn("object-cover", imageClassName)}
      />
    </div>
  );
}
