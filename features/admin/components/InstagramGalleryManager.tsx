"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, ImagePlus, Plus, Repeat, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminInstagramService } from "@/features/admin/services/adminInstagram.service";
import { InstagramPostFormDialog } from "@/features/admin/components/InstagramPostFormDialog";
import { ReplaceInstagramPostDialog } from "@/features/admin/components/ReplaceInstagramPostDialog";
import { cn } from "@/lib/utils";
import type { IInstagramPost } from "@/types/instagram";

function sortByDisplayOrder(posts: IInstagramPost[]) {
  return [...posts].sort((a, b) => a.displayOrder - b.displayOrder);
}

export function InstagramGalleryManager({ initialPosts }: { initialPosts: IInstagramPost[] }) {
  const [posts, setPosts] = useState(() => sortByDisplayOrder(initialPosts));
  const [formOpen, setFormOpen] = useState(false);
  const [replacing, setReplacing] = useState<IInstagramPost | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  function handleAdded(post: IInstagramPost) {
    setPosts((prev) => sortByDisplayOrder([...prev, post]));
  }

  function handleReplaced(post: IInstagramPost) {
    setPosts((prev) => sortByDisplayOrder(prev.map((item) => (item.id === post.id ? post : item))));
  }

  async function handleRemove(post: IInstagramPost) {
    setRemovingId(post.id);
    const result = await adminInstagramService.remove(post.id);
    setRemovingId(null);

    if (!result.success) {
      toast.error(result.message || "Could not remove image.");
      return;
    }
    toast.success("Image removed.");
    setPosts((prev) => prev.filter((item) => item.id !== post.id));
  }

  async function handleToggleVisible(post: IInstagramPost) {
    setTogglingId(post.id);
    const result = await adminInstagramService.update(post.id, { isVisible: !post.isVisible });
    setTogglingId(null);

    if (!result.success || !result.data) {
      toast.error(result.message || "Could not update visibility.");
      return;
    }
    toast.success(post.isVisible ? "Image hidden." : "Image shown.");
    setPosts((prev) => prev.map((item) => (item.id === post.id ? result.data! : item)));
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= posts.length) return;

    const current = posts[index];
    const target = posts[targetIndex];

    const reordered = [...posts];
    reordered[index] = target;
    reordered[targetIndex] = current;
    setPosts(reordered);

    const [firstResult, secondResult] = await Promise.all([
      adminInstagramService.update(current.id, { displayOrder: target.displayOrder }),
      adminInstagramService.update(target.id, { displayOrder: current.displayOrder }),
    ]);

    if (!firstResult.success || !secondResult.success) {
      toast.error("Could not reorder images.");
      setPosts((prev) => sortByDisplayOrder(prev));
      return;
    }

    setPosts((prev) =>
      sortByDisplayOrder(
        prev.map((item) => {
          if (item.id === current.id) return { ...item, displayOrder: target.displayOrder };
          if (item.id === target.id) return { ...item, displayOrder: current.displayOrder };
          return item;
        })
      )
    );
  }

  const visiblePosts = posts.filter((post) => post.isVisible);
  const visibleCount = visiblePosts.length;
  const homepagePostIds = new Set(visiblePosts.slice(0, 8).map((post) => post.id));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          The first {Math.min(visibleCount, 8)} visible image{visibleCount === 1 ? "" : "s"} (of {visibleCount} visible)
          show on the homepage. Reorder with the arrows.
        </p>
        <Button type="button" size="sm" onClick={() => setFormOpen(true)}>
          <Plus /> Add Images
        </Button>
      </div>

      {posts.length === 0 ? (
        <AdminEmptyState
          icon={ImagePlus}
          title="No images yet"
          description="Upload photos to populate the homepage's Follow Our Style section."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {posts.map((post, index) => (
            <div key={post.id} className="flex flex-col gap-2 rounded-lg border border-border-light p-2">
              <div className="relative overflow-hidden rounded-md bg-bg-section">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin-entered arbitrary URL */}
                <img
                  src={post.imageUrl}
                  alt=""
                  className={cn("aspect-square w-full object-cover", !post.isVisible && "opacity-40")}
                />
                <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
                  {homepagePostIds.has(post.id) && (
                    <Badge variant="outline" className="border-transparent bg-blush text-[10px] text-text-primary">
                      On Homepage
                    </Badge>
                  )}
                  {!post.isVisible && (
                    <Badge variant="outline" className="border-transparent bg-muted text-[10px] text-text-muted">
                      Hidden
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between gap-1">
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Move earlier"
                    disabled={index === 0}
                    onClick={() => handleMove(index, -1)}
                  >
                    <ArrowUp className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Move later"
                    disabled={index === posts.length - 1}
                    onClick={() => handleMove(index, 1)}
                  >
                    <ArrowDown className="size-3.5" />
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={post.isVisible ? "Hide image" : "Show image"}
                  disabled={togglingId === post.id}
                  onClick={() => handleToggleVisible(post)}
                >
                  {post.isVisible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Replace image"
                  onClick={() => setReplacing(post)}
                >
                  <Repeat className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Remove image"
                  disabled={removingId === post.id}
                  onClick={() => handleRemove(post)}
                >
                  <Trash2 className="size-3.5 text-danger" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <InstagramPostFormDialog open={formOpen} onOpenChange={setFormOpen} onSaved={handleAdded} />
      <ReplaceInstagramPostDialog
        open={!!replacing}
        onOpenChange={(open) => !open && setReplacing(null)}
        post={replacing}
        onSaved={handleReplaced}
      />
    </div>
  );
}
