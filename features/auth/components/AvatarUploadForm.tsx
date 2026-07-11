"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CloudinaryUploader, type CloudinaryUploadResult } from "@/components/shared/CloudinaryUploader";
import { useAuth } from "@/hooks/useAuth";
import type { IUser } from "@/types/user";

export function AvatarUploadForm({ user }: { user: IUser }) {
  const { refreshProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  async function handleUploaded(result: CloudinaryUploadResult) {
    setIsSaving(true);
    const response = await fetch("/api/profile/avatar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarUrl: result.url, avatarPublicId: result.publicId }),
    });
    const json = await response.json();
    setIsSaving(false);

    if (!json.success) {
      toast.error(json.message || "Could not update your profile photo.");
      return;
    }
    toast.success("Profile photo updated.");
    await refreshProfile();
  }

  async function handleRemove() {
    setIsRemoving(true);
    const response = await fetch("/api/profile/avatar", { method: "DELETE" });
    const json = await response.json();
    setIsRemoving(false);

    if (!json.success) {
      toast.error(json.message || "Could not remove your profile photo.");
      return;
    }
    toast.success("Profile photo removed.");
    await refreshProfile();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blush font-heading text-lg font-semibold text-text-primary">
          {user.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element -- Cloudinary URL, not registered in next/image remotePatterns
            <img src={user.avatar} alt="" className="size-full object-cover" />
          ) : (
            <>
              {user.firstName[0]}
              {user.lastName[0]}
            </>
          )}
        </div>
        {user.avatar && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-danger hover:text-danger"
            disabled={isRemoving || isSaving}
            onClick={handleRemove}
          >
            <Trash2 /> {isRemoving ? "Removing..." : "Remove Photo"}
          </Button>
        )}
      </div>

      <CloudinaryUploader
        signUrl="/api/cloudinary/sign"
        disabled={isSaving}
        onUploaded={handleUploaded}
      />
    </div>
  );
}
