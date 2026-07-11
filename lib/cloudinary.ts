import "server-only";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const CLOUDINARY_UPLOAD_FOLDER = "moonkart";

/**
 * Signs a direct browser-to-Cloudinary upload so the API secret never
 * reaches the client. The browser then POSTs the file straight to
 * Cloudinary using this signature — our server never proxies the file
 * bytes, keeping large multi-image uploads fast and off our own compute.
 */
export function signUpload(paramsToSign: Record<string, string | number>) {
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { ...paramsToSign, timestamp, folder: CLOUDINARY_UPLOAD_FOLDER },
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    folder: CLOUDINARY_UPLOAD_FOLDER,
  };
}

/** Best-effort delete — swallows errors so a missing/already-deleted asset never blocks removing our own DB row. */
export async function destroyCloudinaryAsset(publicId: string) {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch {
    // Already gone, or Cloudinary is briefly unreachable — the DB row is
    // still the source of truth for what the storefront displays, so we
    // don't fail the caller's request over a best-effort cleanup step.
  }
}

export { cloudinary };
