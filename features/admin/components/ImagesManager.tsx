"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Plus, Repeat, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { Button } from "@/components/ui/button";
import { adminProductService } from "@/features/admin/services/adminProduct.service";
import { ImageFormDialog } from "@/features/admin/components/ImageFormDialog";
import { ReplaceImageDialog } from "@/features/admin/components/ReplaceImageDialog";
import type { IProductImage } from "@/types/product";

function sortByDisplayOrder(images: IProductImage[]) {
  return [...images].sort((a, b) => a.displayOrder - b.displayOrder);
}

export function ImagesManager({
  productId,
  initialImages,
}: {
  productId: string;
  initialImages: IProductImage[];
}) {
  const [images, setImages] = useState(() => sortByDisplayOrder(initialImages));
  const [formOpen, setFormOpen] = useState(false);
  const [replacing, setReplacing] = useState<IProductImage | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  function handleAdded(image: IProductImage) {
    setImages((prev) => sortByDisplayOrder([...prev, image]));
  }

  function handleReplaced(image: IProductImage) {
    setImages((prev) => sortByDisplayOrder(prev.map((item) => (item.id === image.id ? image : item))));
  }

  async function handleRemove(image: IProductImage) {
    setRemovingId(image.id);
    const result = await adminProductService.removeImage(productId, image.id);
    setRemovingId(null);

    if (!result.success) {
      toast.error(result.message || "Could not remove image.");
      return;
    }
    toast.success("Image removed.");
    setImages((prev) => prev.filter((item) => item.id !== image.id));
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const current = images[index];
    const target = images[targetIndex];

    const reordered = [...images];
    reordered[index] = target;
    reordered[targetIndex] = current;
    setImages(reordered);

    const [firstResult, secondResult] = await Promise.all([
      adminProductService.updateImage(productId, current.id, { displayOrder: target.displayOrder }),
      adminProductService.updateImage(productId, target.id, { displayOrder: current.displayOrder }),
    ]);

    if (!firstResult.success || !secondResult.success) {
      toast.error("Could not reorder images.");
      setImages((prev) => sortByDisplayOrder(prev));
      return;
    }

    setImages((prev) =>
      sortByDisplayOrder(
        prev.map((item) => {
          if (item.id === current.id) return { ...item, displayOrder: target.displayOrder };
          if (item.id === target.id) return { ...item, displayOrder: current.displayOrder };
          return item;
        })
      )
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          The first image is used as the primary gallery image. Reorder with the arrows.
        </p>
        <Button type="button" size="sm" onClick={() => setFormOpen(true)}>
          <Plus /> Add Images
        </Button>
      </div>

      {images.length === 0 ? (
        <AdminEmptyState icon={ImagePlus} title="No extra images yet" description="Add more angles or lifestyle shots." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image, index) => (
            <div key={image.id} className="flex flex-col gap-2 rounded-lg border border-border-light p-2">
              <div className="relative overflow-hidden rounded-md bg-bg-section">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin-entered arbitrary URL */}
                <img src={image.imageUrl} alt="" className="aspect-square w-full object-cover" />
                {index === 0 && (
                  <span className="absolute top-1.5 left-1.5 rounded-full bg-blush px-2 py-0.5 text-[10px] font-semibold text-text-primary">
                    Primary
                  </span>
                )}
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
                    disabled={index === images.length - 1}
                    onClick={() => handleMove(index, 1)}
                  >
                    <ArrowDown className="size-3.5" />
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Replace image"
                  onClick={() => setReplacing(image)}
                >
                  <Repeat className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Remove image"
                  disabled={removingId === image.id}
                  onClick={() => handleRemove(image)}
                >
                  <Trash2 className="size-3.5 text-danger" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ImageFormDialog open={formOpen} onOpenChange={setFormOpen} productId={productId} onSaved={handleAdded} />
      <ReplaceImageDialog
        open={!!replacing}
        onOpenChange={(open) => !open && setReplacing(null)}
        productId={productId}
        image={replacing}
        onSaved={handleReplaced}
      />
    </div>
  );
}
