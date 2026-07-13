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
import { adminInstagramService } from "@/features/admin/services/adminInstagram.service";
import type { IInstagramPost } from "@/types/instagram";

interface InstagramPostFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (post: IInstagramPost) => void;
}

export function InstagramPostFormDialog({ open, onOpenChange, onSaved }: InstagramPostFormDialogProps) {
  async function handleUploaded(result: CloudinaryUploadResult) {
    const response = await adminInstagramService.create({
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
