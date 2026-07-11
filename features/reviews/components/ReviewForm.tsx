"use client";

import { useState } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CloudinaryUploader, type CloudinaryUploadResult } from "@/components/shared/CloudinaryUploader";
import { RatingStars } from "@/features/reviews/components/RatingStars";
import { reviewSchema, type ReviewInput } from "@/features/reviews/validation/review.schema";
import type { IReviewWithRelations } from "@/types/review";

interface ReviewFormProps {
  productSlug: string;
  existingReview?: IReviewWithRelations | null;
  onSaved: (review: IReviewWithRelations) => void;
  onCancel: () => void;
}

export function ReviewForm({ productSlug, existingReview, onSaved, onCancel }: ReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<CloudinaryUploadResult[]>(
    existingReview?.images.map((image) => ({ url: image.imageUrl, publicId: image.publicId ?? "" })) ?? []
  );

  const form = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: existingReview?.rating ?? 0,
      title: existingReview?.title ?? "",
      comment: existingReview?.comment ?? "",
    },
  });

  function handleUploaded(result: CloudinaryUploadResult) {
    setImages((prev) => [...prev, result]);
  }

  function handleRemoveImage(publicId: string) {
    setImages((prev) => prev.filter((image) => image.publicId !== publicId));
  }

  async function onSubmit(values: ReviewInput) {
    setIsSubmitting(true);
    const payload = {
      ...values,
      images: images.map((image) => ({ imageUrl: image.url, publicId: image.publicId })),
    };

    const response = existingReview
      ? await fetch(`/api/reviews/${existingReview.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch(`/api/products/${productSlug}/reviews`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    const result = await response.json();
    setIsSubmitting(false);

    if (!result.success || !result.data) {
      toast.error(result.message || "Could not submit review.");
      return;
    }

    toast.success(existingReview ? "Review updated." : "Review submitted.");
    onSaved(result.data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 rounded-lg border border-border-light p-5">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Rating</FormLabel>
              <FormControl>
                <RatingStars rating={field.value} size="lg" interactive onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Review Title</FormLabel>
              <FormControl>
                <Input placeholder="Sum up your experience" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Review</FormLabel>
              <FormControl>
                <Textarea rows={4} placeholder="What did you like or dislike?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-2">
          <FormLabel>Photos (optional)</FormLabel>
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {images.map((image) => (
                <div key={image.publicId} className="relative size-16 shrink-0 overflow-hidden rounded-lg ring-1 ring-border-light">
                  <Image src={image.url} alt="" fill sizes="64px" className="object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(image.publicId)}
                    aria-label="Remove photo"
                    className="absolute top-0.5 right-0.5 flex size-5 items-center justify-center rounded-full bg-black/60 text-white"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {images.length < 6 && <CloudinaryUploader multiple signUrl="/api/cloudinary/sign" onUploaded={handleUploaded} />}
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting…" : existingReview ? "Save Changes" : "Submit Review"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
