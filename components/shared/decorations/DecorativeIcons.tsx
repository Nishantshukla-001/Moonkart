interface DoodleIconProps {
  className?: string;
}

/**
 * Original, hand-authored line-art doodle icons (heart/flower/bow/sparkle/
 * star/leaf/squiggle) — the recurring decorative vocabulary used across the
 * homepage instead of scattering random third-party icon glyphs. Every icon
 * draws in `currentColor` so Tailwind `text-*` utilities control fill/stroke,
 * and every icon is `aria-hidden` since these are purely decorative.
 */

export function HeartDoodle({ className }: DoodleIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true" focusable="false">
      <path
        d="M12 20.5s-7.2-4.5-9.6-8.9C.8 8.2 2.3 4.9 5.5 4.1c2-.5 3.9.4 5.2 2C11.9 4.3 13.9 3.4 15.8 3.9c3.3.8 4.7 4.2 3.1 7.2C16.4 15.8 12 20.5 12 20.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FlowerDoodle({ className }: DoodleIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true" focusable="false">
      <g stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round">
        <circle cx="12" cy="7" r="2.5" />
        <circle cx="17.3" cy="10.5" r="2.5" />
        <circle cx="15.3" cy="16.6" r="2.5" />
        <circle cx="8.7" cy="16.6" r="2.5" />
        <circle cx="6.7" cy="10.5" r="2.5" />
      </g>
      <circle cx="12" cy="11.8" r="1.9" fill="currentColor" />
    </svg>
  );
}

export function BowDoodle({ className }: DoodleIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true" focusable="false">
      <path
        d="M11.3 12 2.9 7.2c-1-.6-2.2.2-2.1 1.4l.3 2.9c.1.9.8 1.5 1.7 1.4l8.5-.9M12.7 12l8.4-4.8c1-.6 2.2.2 2.1 1.4l-.3 2.9c-.1.9-.8 1.5-1.7 1.4L12.7 12"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function SparkleDoodle({ className }: DoodleIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" focusable="false">
      <path d="M12 2c.7 4.8 2.4 6.5 7 7-4.6.5-6.3 2.2-7 7-.7-4.8-2.4-6.5-7-7 4.6-.5 6.3-2.2 7-7Z" />
    </svg>
  );
}

export function StarDoodle({ className }: DoodleIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true" focusable="false">
      <path
        d="m12 3 2.1 5.5L20 10l-4.6 3.5 1.3 6.2L12 16.4 7.3 19.7l1.3-6.2L4 10l5.9-1.5L12 3Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LeafDoodle({ className }: DoodleIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true" focusable="false">
      <path d="M4.5 19.5c0-8.5 4.7-14 14-14 0 8.5-4.7 14-14 14Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M5.3 18.7 16.5 7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function SquiggleDoodle({ className }: DoodleIconProps) {
  return (
    <svg viewBox="0 0 40 12" fill="none" className={className} aria-hidden="true" focusable="false">
      <path d="M1 6c2.8-4.6 5.7-4.6 8.5 0s5.7 4.6 8.5 0 5.7-4.6 8.5 0 5.7 4.6 8.5 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
