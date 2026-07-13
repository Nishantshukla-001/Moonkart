import "server-only";

import { destroyCloudinaryAsset } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import type {
  InstagramPostInput,
  UpdateInstagramPostInput,
} from "@/features/instagram/validation/instagramPost.schema";
import type { IInstagramPost } from "@/types/instagram";

/** Storefront query — the homepage "Follow Our Style" section, newest curation first. */
export function getVisibleInstagramPosts(limit = 8): Promise<IInstagramPost[]> {
  return prisma.instagramPost.findMany({
    where: { isVisible: true },
    orderBy: { displayOrder: "asc" },
    take: limit,
  });
}

export function getInstagramPostsAdmin(): Promise<IInstagramPost[]> {
  return prisma.instagramPost.findMany({ orderBy: { displayOrder: "asc" } });
}

/**
 * Appends to the end of the current order. A single admin manages this
 * gallery (unlike checkout's concurrent-customer stock decrements), so a
 * plain max+1 read is proportionate — no transaction lock is needed.
 */
export async function createInstagramPost(data: InstagramPostInput) {
  const last = await prisma.instagramPost.findFirst({ orderBy: { displayOrder: "desc" } });
  const displayOrder = last ? last.displayOrder + 1 : 0;

  return prisma.instagramPost.create({
    data: { imageUrl: data.imageUrl, publicId: data.publicId || null, displayOrder },
  });
}

export async function updateInstagramPost(id: string, data: UpdateInstagramPostInput) {
  // Replacing the image itself (not just reordering/toggling) — clean up the
  // outgoing Cloudinary asset once the swap has committed.
  const previous =
    data.imageUrl !== undefined
      ? await prisma.instagramPost.findUnique({ where: { id }, select: { publicId: true } })
      : null;

  const updated = await prisma.instagramPost.update({
    where: { id },
    data: {
      ...(data.displayOrder !== undefined && { displayOrder: data.displayOrder }),
      ...(data.isVisible !== undefined && { isVisible: data.isVisible }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
      ...(data.publicId !== undefined && { publicId: data.publicId || null }),
    },
  });

  if (previous?.publicId && previous.publicId !== data.publicId) {
    await destroyCloudinaryAsset(previous.publicId);
  }

  return updated;
}

export async function deleteInstagramPost(id: string) {
  const post = await prisma.instagramPost.findUnique({ where: { id }, select: { publicId: true } });
  const deleted = await prisma.instagramPost.delete({ where: { id } });

  if (post?.publicId) await destroyCloudinaryAsset(post.publicId);

  return deleted;
}
