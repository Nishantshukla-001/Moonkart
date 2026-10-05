/**
 * Appends a Cloudinary on-the-fly resize transformation so list/grid
 * thumbnails download a pre-resized image instead of the full original
 * upload — e.g. a 40px table thumbnail was previously fetching whatever
 * resolution the admin originally uploaded. Any URL that isn't a Cloudinary
 * delivery URL (legacy/manual values) is returned unchanged, since only
 * Cloudinary understands this transformation syntax.
 */
export function cloudinaryThumbnail(url: string, size: number): string {
  const marker = "/upload/";
  const index = url.indexOf(marker);
  if (!url.includes("res.cloudinary.com") || index === -1) return url;

  const transformation = `w_${size},h_${size},c_fill,q_auto,f_auto`;
  return `${url.slice(0, index + marker.length)}${transformation}/${url.slice(index + marker.length)}`;
}
