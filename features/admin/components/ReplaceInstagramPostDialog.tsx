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

interface ReplaceInstagramPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: IInstagramPost | null;
  onSaved: (post: IInstagramPost) => void;
}

export function ReplaceInstagramPostDialog({ open, onOpenChange, post, onSaved }: ReplaceInstagramPostDialogProps) {
  async function handleUploaded(result: CloudinaryUploadResult) {
    if (!post) return;

    const response = await adminInstagramService.update(post.id, {
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
