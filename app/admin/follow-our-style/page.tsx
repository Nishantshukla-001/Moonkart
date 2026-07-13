import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { InstagramGalleryManager } from "@/features/admin/components/InstagramGalleryManager";
import { getInstagramPostsAdmin } from "@/features/instagram/services/instagramPost.service";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Follow Our Style" };

export default async function AdminFollowOurStylePage() {
  await requireAdmin();
  const posts = await getInstagramPostsAdmin();

  return (
    <>
      <AdminPageHeader
        title="Follow Our Style"
        description="Manage the images shown in the homepage's Follow Our Style section."
        breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Follow Our Style" }]}
      />

      <InstagramGalleryManager initialPosts={posts} />
    </>
  );
}
