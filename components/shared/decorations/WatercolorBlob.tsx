const BLOB_PATHS = {
  a: "M45.6,-58.3C58.5,-49.6,67.5,-33.9,70.6,-17.2C73.7,-0.5,71,17.2,62.6,31.4C54.3,45.6,40.3,56.3,24.6,62.1C8.9,67.9,-8.5,68.8,-24.5,63.6C-40.5,58.4,-55.1,47.1,-63.1,32.2C-71.1,17.3,-72.5,-1.2,-67.4,-17.5C-62.3,-33.8,-50.7,-47.9,-36.4,-56.6C-22.1,-65.3,-5.1,-68.6,10.8,-67.1C26.7,-65.6,32.7,-67,45.6,-58.3Z",
  b: "M42.8,-54.7C54.9,-45.5,63.5,-30.9,66.9,-15.1C70.3,0.7,68.5,17.7,60.6,31.3C52.7,44.9,38.7,55.1,23.2,60.8C7.7,66.5,-9.3,67.7,-25.1,62.8C-40.9,57.9,-55.5,46.9,-63.5,32.1C-71.5,17.3,-72.9,-1.3,-67.8,-17.5C-62.7,-33.7,-51.1,-47.5,-37.1,-56.4C-23.1,-65.3,-6.7,-69.3,8.6,-66.7C23.9,-64.1,30.7,-63.9,42.8,-54.7Z",
  c: "M38.9,-49.6C50.1,-42.1,58.6,-29.9,62.8,-15.9C67,-1.9,66.9,13.9,60.9,27.2C54.9,40.5,43,51.3,29.3,57.8C15.6,64.3,0.1,66.5,-15.2,63.6C-30.5,60.7,-45.6,52.7,-55.4,40.2C-65.2,27.7,-69.7,10.7,-68.1,-5.5C-66.5,-21.7,-58.8,-37.1,-46.9,-44.8C-35,-52.5,-18.9,-52.5,-2.6,-49.4C13.7,-46.3,27.7,-57.1,38.9,-49.6Z",
} as const;

interface WatercolorBlobProps {
  className?: string;
  variant?: keyof typeof BLOB_PATHS;
}

/**
 * Organic, hand-tuned blob shape (not a perfect circle) — the "watercolor
 * splash" behind homepage sections. Fill with `text-*` utilities via
 * `currentColor` and size/blur/opacity via className; three variants avoid
 * every blob on the page reading as an identical stamped shape.
 */
export function WatercolorBlob({ className, variant = "a" }: WatercolorBlobProps) {
  return (
    <svg viewBox="-100 -100 200 200" className={className} aria-hidden="true" focusable="false">
      <path fill="currentColor" d={BLOB_PATHS[variant]} />
    </svg>
  );
}
