/**
 * Single source of truth for placeholder image URLs.
 *
 * Every product, category, collection, and banner image in the app is
 * rendered through components/shared/AspectImage.tsx and sourced from a
 * plain `image` field on its data object (see lib/placeholderData.ts).
 *
 * When real product photography is available (e.g. uploaded to Cloudinary
 * per docs/TechStack.md), replace the value of that `image` field with the
 * real URL — no component, layout, or page code needs to change, since
 * every card/banner/gallery already just renders whatever URL it's given.
 */
export function placeholderImage(seed: string, width: number, height: number): string {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}
