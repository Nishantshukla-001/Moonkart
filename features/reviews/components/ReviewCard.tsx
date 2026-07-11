"use client";

import { useState } from "react";
import Image from "next/image";
import { BadgeCheck, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/features/reviews/components/RatingStars";
import { formatDate } from "@/utils/formatDate";
import type { IReviewWithRelations } from "@/types/review";

interface ReviewCardProps {
  review: IReviewWithRelations;
  isOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ReviewCard({ review, isOwner, onEdit, onDelete }: ReviewCardProps) {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3 border-b border-divider py-6 first:pt-0 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blush font-heading text-sm font-semibold text-text-primary">
            {review.user.firstName[0]}
            {review.user.lastName[0]}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-heading text-sm font-semibold text-text-primary">
                {review.user.firstName} {review.user.lastName[0]}.
              </p>
              {review.isVerifiedPurchase && (
                <span className="flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-semibold text-success">
                  <BadgeCheck className="size-3" aria-hidden="true" />
                  Verified Purchase
                </span>
              )}
            </div>
            <p className="text-xs text-text-muted">{formatDate(review.createdAt)}</p>
          </div>
        </div>

        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />} aria-label="Review actions">
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={onDelete}>
                <Trash2 /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <RatingStars rating={review.rating} />

      <div>
        <h4 className="font-heading text-sm font-semibold text-text-primary">{review.title}</h4>
        <p className="mt-1 text-sm leading-[160%] whitespace-pre-line text-text-secondary">{review.comment}</p>
      </div>

      {review.images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {review.images.map((image) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setLightboxImage(image.imageUrl)}
              className="relative size-16 shrink-0 overflow-hidden rounded-lg ring-1 ring-border-light transition-opacity hover:opacity-80"
            >
              <Image src={image.imageUrl} alt="Customer photo" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightboxImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Customer photo"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative h-full max-h-[80vh] w-full max-w-2xl">
            <Image src={lightboxImage} alt="Customer photo" fill sizes="100vw" className="object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
