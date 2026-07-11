"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, UploadCloud } from "lucide-react";

import { cn } from "@/lib/utils";

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

interface PendingUpload {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
  error?: string;
}

interface CloudinaryUploaderProps {
  multiple?: boolean;
  disabled?: boolean;
  onUploaded: (result: CloudinaryUploadResult) => void;
  className?: string;
  /** Which signing endpoint to call — admin product images vs. any authenticated customer (e.g. review photos). */
  signUrl?: "/api/admin/cloudinary/sign" | "/api/cloudinary/sign";
}

async function uploadOneFile(
  file: File,
  signUrl: string,
  onProgress: (percent: number) => void
): Promise<CloudinaryUploadResult> {
  const signRes = await fetch(signUrl, { method: "POST" });
  const signJson = await signRes.json();
  if (!signJson.success) throw new Error(signJson.message || "Could not start upload.");

  const { timestamp, signature, apiKey, cloudName, folder } = signJson.data;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", folder);

  return new Promise<CloudinaryUploadResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      try {
        const json = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({ url: json.secure_url, publicId: json.public_id });
        } else {
          reject(new Error(json.error?.message || "Upload failed."));
        }
      } catch {
        reject(new Error("Upload failed."));
      }
    };
    xhr.onerror = () => reject(new Error("Could not reach Cloudinary. Check your connection and try again."));

    xhr.send(formData);
  });
}

/**
 * Drag-and-drop / click-to-browse image uploader. Files upload directly from
 * the browser to Cloudinary (signed by our server, see /api/*\/cloudinary/sign)
 * with a live progress bar per file — our own server never proxies the bytes.
 */
export function CloudinaryUploader({
  multiple = false,
  disabled,
  onUploaded,
  className,
  signUrl = "/api/admin/cloudinary/sign",
}: CloudinaryUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (fileList: FileList | File[]) => {
      const files = Array.from(fileList).filter((file) => file.type.startsWith("image/"));
      if (files.length === 0) return;

      const entries: PendingUpload[] = files.map((file) => ({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
        file,
        previewUrl: URL.createObjectURL(file),
        progress: 0,
      }));
      setPending((prev) => [...prev, ...entries]);

      entries.forEach((entry) => {
        uploadOneFile(entry.file, signUrl, (percent) => {
          setPending((prev) => prev.map((item) => (item.id === entry.id ? { ...item, progress: percent } : item)));
        })
          .then((result) => {
            setPending((prev) => prev.filter((item) => item.id !== entry.id));
            URL.revokeObjectURL(entry.previewUrl);
            onUploaded(result);
          })
          .catch((error: Error) => {
            setPending((prev) =>
              prev.map((item) => (item.id === entry.id ? { ...item, error: error.message } : item))
            );
            toast.error(`${entry.file.name}: ${error.message}`);
          });
      });
    },
    [onUploaded, signUrl]
  );

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    handleFiles(event.dataTransfer.files);
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(event) => {
          if ((event.key === "Enter" || event.key === " ") && !disabled) inputRef.current?.click();
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        aria-label="Upload images"
        aria-disabled={disabled}
        className={cn(
          "flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors duration-[200ms] outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          isDragging ? "border-blush-hover bg-blush-light/40" : "border-border-medium hover:border-blush",
          disabled && "pointer-events-none opacity-50"
        )}
      >
        <UploadCloud className="size-7 text-blush-hover" aria-hidden="true" />
        <p className="text-sm font-medium text-text-primary">
          Drag &amp; drop {multiple ? "images" : "an image"} here, or click to browse
        </p>
        <p className="text-xs text-text-muted">PNG, JPG, or WEBP</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          disabled={disabled}
          className="sr-only"
          onChange={(event) => {
            if (event.target.files) handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {pending.length > 0 && (
        <div className="flex flex-col gap-2">
          {pending.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-lg border border-border-light p-2">
              {/* eslint-disable-next-line @next/next/no-img-element -- transient local object-URL preview, never persisted */}
              <img src={item.previewUrl} alt="" className="size-10 shrink-0 rounded-md object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-text-primary">{item.file.name}</p>
                {item.error ? (
                  <p className="text-xs text-danger">{item.error}</p>
                ) : (
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-bg-section">
                    <div
                      className="h-full rounded-full bg-blush-hover transition-all duration-200"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
              </div>
              {!item.error && <Loader2 className="size-4 shrink-0 animate-spin text-text-muted" aria-hidden="true" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
