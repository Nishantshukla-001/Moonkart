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

interface ImageFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  onSaved: (image: IProductImage) => void;
}

export function ImageFormDialog({ open, onOpenChange, productId, onSaved }: ImageFormDialogProps) {
  async function handleUploaded(result: CloudinaryUploadResult) {
    const response = await adminProductService.addImage(productId, {
      imageUrl: result.url,
      publicId: result.publicId,
    });

    if (!response.success || !response.data) {
      toast.error(response.message || "Could not save the uploaded image.");
      return;
    }

    toast.success("Image added.");
    onSaved(response.data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Images</DialogTitle>
          <DialogDescription>Upload one or more images — each finishes and saves automatically.</DialogDescription>
        </DialogHeader>

        <CloudinaryUploader multiple onUploaded={handleUploaded} />
      </DialogContent>
    </Dialog>
  );
}
