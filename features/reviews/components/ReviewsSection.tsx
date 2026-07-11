"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { MessageSquareText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RatingBreakdown } from "@/features/reviews/components/RatingBreakdown";
import { ReviewCard } from "@/features/reviews/components/ReviewCard";
import { ReviewForm } from "@/features/reviews/components/ReviewForm";
import { Pagination } from "@/components/shared/Pagination";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import type { ReviewSort } from "@/features/reviews/validation/review.schema";
import type { IPaginatedReviews, IRatingBreakdown, IReviewWithRelations } from "@/types/review";

interface ReviewsSectionProps {
  productSlug: string;
  initialBreakdown: IRatingBreakdown;
}

export function ReviewsSection({ productSlug, initialBreakdown }: ReviewsSectionProps) {
  const { profile, isLoading: authLoading } = useAuth();
  const [breakdown, setBreakdown] = useState(initialBreakdown);
  const [result, setResult] = useState<IPaginatedReviews | null>(null);
  const [sort, setSort] = useState<ReviewSort>("newest");
  const [page, setPage] = useState(1);
  const [eligibility, setEligibility] = useState<{
    canReview: boolean;
    hasPurchased: boolean;
    existingReview: IReviewWithRelations | null;
  } | null>(null);
  const [formMode, setFormMode] = useState<"none" | "create" | "edit">("none");
  const [deleting, setDeleting] = useState<IReviewWithRelations | null>(null);

  async function loadReviews() {
    const response = await fetch(`/api/products/${productSlug}/reviews?sort=${sort}&page=${page}`, { cache: "no-store" });
    const json = await response.json();
    if (json.success) setResult(json.data);
  }

  async function loadEligibility() {
    if (!profile) {
      setEligibility(null);
      return;
    }
    const response = await fetch(`/api/products/${productSlug}/reviews/eligibility`, { cache: "no-store" });
    const json = await response.json();
    if (json.success) setEligibility(json.data);
  }

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loadReviews reads sort/page/productSlug fresh via closure each render
  }, [sort, page, productSlug]);

  useEffect(() => {
    if (!authLoading) loadEligibility();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loadEligibility reads profile/productSlug fresh via closure each render
  }, [authLoading, profile, productSlug]);

  async function refreshBreakdown() {
    const response = await fetch(`/api/products/${productSlug}/reviews/breakdown`, { cache: "no-store" });
    const json = await response.json();
    if (json.success) setBreakdown(json.data);
  }

  function handleReviewSaved() {
    setFormMode("none");
    toast.success("Thank you for your review!");
    loadReviews();
    loadEligibility();
    refreshBreakdown();
  }

  async function handleDelete() {
    if (!deleting) return;
    const response = await fetch(`/api/reviews/${deleting.id}`, { method: "DELETE" });
    const result = await response.json();
    if (!result.success) {
      toast.error(result.message || "Could not delete review.");
      return;
    }
    toast.success("Review deleted.");
    setDeleting(null);
    loadReviews();
    loadEligibility();
    refreshBreakdown();
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-heading text-xl font-semibold text-text-primary">Customer Reviews</h2>

      <RatingBreakdown breakdown={breakdown} />

      {!authLoading && !profile && (
        <p className="text-sm text-text-secondary">
          <Link href={ROUTES.login} className="font-semibold text-blush-hover hover:text-text-primary">
            Log in
          </Link>{" "}
          to write a review after purchasing this product.
        </p>
      )}

      {profile && eligibility && formMode === "none" && (
        <div>
          {eligibility.existingReview ? (
            <Button variant="outline" onClick={() => setFormMode("edit")}>
              Edit Your Review
            </Button>
          ) : eligibility.canReview ? (
            <Button onClick={() => setFormMode("create")}>
              <MessageSquareText /> Write a Review
            </Button>
          ) : (
            <p className="text-sm text-text-muted">
              {eligibility.hasPurchased
                ? "You've already reviewed this product."
                : "Purchase this product to leave a review."}
            </p>
          )}
        </div>
      )}

      {formMode !== "none" && (
        <ReviewForm
          productSlug={productSlug}
          existingReview={formMode === "edit" ? eligibility?.existingReview : null}
          onSaved={handleReviewSaved}
          onCancel={() => setFormMode("none")}
        />
      )}

      {result && result.items.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">
              {result.total} review{result.total === 1 ? "" : "s"}
            </p>
            <Select value={sort} onValueChange={(value) => setSort(value as ReviewSort)}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="highest">Highest Rating</SelectItem>
                <SelectItem value="lowest">Lowest Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col">
            {result.items.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                isOwner={profile?.id === review.userId}
                onEdit={() => setFormMode("edit")}
                onDelete={() => setDeleting(review)}
              />
            ))}
          </div>

          {result.totalPages > 1 && (
            <Pagination currentPage={result.page} totalPages={result.totalPages} onPageChange={setPage} />
          )}
        </>
      )}

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete review?"
        description="This review will be permanently removed."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}
