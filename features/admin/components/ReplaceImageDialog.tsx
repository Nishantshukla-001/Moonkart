"use client";

import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CloudinaryUploader, type CloudinaryUploadResult } from "@/components/shared/CloudinaryUploader";
import { adminProductService } from "@/features/admin/services/adminProduct.service";
import type { IProductImage } from "@/types/product";

interface ReplaceImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  image: IProductImage | null;
  onSaved: (image: IProductImage) => void;
}

export function ReplaceImageDialog({ open, onOpenChange, productId, image, onSaved }: ReplaceImageDialogProps) {
  async function handleUploaded(result: CloudinaryUploadResult) {
    if (!image) return;

    const response = await adminProductService.updateImage(productId, image.id, {
      imageUrl: result.url,
      publicId: result.publicId,
    });

    if (!response.success || !response.data) {
      toast.error(response.message || "Could not replace image.");
      return;
    }

    toast.success("Image replaced.");
    onSaved(response.data);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Replace Image</DialogTitle>
          <DialogDescription>Upload a new image to replace this one. The old image will be removed.</DialogDescription>
        </DialogHeader>

        <CloudinaryUploader onUploaded={handleUploaded} />
      </DialogContent>
    </Dialog>
  );
}
