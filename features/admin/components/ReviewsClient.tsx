"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, MoreHorizontal, Search, Star, Trash2 } from "lucide-react";

import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/shared/Pagination";
import { RatingStars } from "@/features/reviews/components/RatingStars";
import { ROUTES } from "@/constants/routes";
import { adminReviewService } from "@/features/admin/services/adminReview.service";
import type { AdminReviewQuery } from "@/features/reviews/validation/review.schema";
import { debounce } from "@/utils/debounce";
import { formatDate } from "@/utils/formatDate";
import type { IAdminReviewListItem, IPaginatedAdminReviews } from "@/types/review";

interface ReviewsClientProps {
  result: IPaginatedAdminReviews;
  query: AdminReviewQuery;
}

export function ReviewsClient({ result, query }: ReviewsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(query.search ?? "");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<IAdminReviewListItem | null>(null);
  const [viewingImages, setViewingImages] = useState<IAdminReviewListItem | null>(null);

  function updateParams(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "all") params.set(key, value);
      else params.delete(key);
    });
    params.delete("page");
    router.push(`${ROUTES.adminReviews}?${params.toString()}`);
  }

  const debouncedSearch = useMemo(
    () => debounce((value: string) => updateParams({ search: value || undefined }), 400),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stable across renders, mirrors ProductsClient's identical pattern
    []
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  function handlePageChange(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${ROUTES.adminReviews}?${params.toString()}`);
  }

  async function handleToggleHidden(review: IAdminReviewListItem) {
    setUpdatingId(review.id);
    const response = await adminReviewService.setHidden(review.id, !review.isHidden);
    setUpdatingId(null);

    if (!response.success) {
      toast.error(response.message || "Could not update review.");
      return;
    }
    toast.success(review.isHidden ? "Review unhidden." : "Review hidden.");
    router.refresh();
  }

  async function handleDelete() {
    if (!deleting) return;
    const response = await adminReviewService.remove(deleting.id);
    if (!response.success) {
      toast.error(response.message || "Could not delete review.");
      return;
    }
    toast.success("Review deleted.");
    setDeleting(null);
    router.refresh();
  }

  return (
    <>
      <AdminPageHeader
        title="Reviews"
        description={`${result.total} review${result.total === 1 ? "" : "s"} across your catalog.`}
        breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Reviews" }]}
      />

      <Card className="p-0">
        <div className="flex flex-col gap-3 border-b border-divider p-4 lg:flex-row lg:items-center lg:flex-wrap">
          <div className="relative w-full lg:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted" />
            <Input
              value={searchValue}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search by product, customer, or text…"
              className="pl-9"
            />
          </div>

          <Select value={String(query.rating ?? "all")} onValueChange={(value) => updateParams({ rating: value ?? undefined })}>
            <SelectTrigger className="w-full lg:w-36">
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              {[5, 4, 3, 2, 1].map((rating) => (
                <SelectItem key={rating} value={String(rating)}>
                  {rating} star{rating === 1 ? "" : "s"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={query.visibility} onValueChange={(value) => updateParams({ visibility: value ?? undefined })}>
            <SelectTrigger className="w-full lg:w-36">
              <SelectValue placeholder="Visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="visible">Visible</SelectItem>
              <SelectItem value="hidden">Hidden</SelectItem>
            </SelectContent>
          </Select>

          <Select value={query.sort} onValueChange={(value) => updateParams({ sort: value ?? undefined })}>
            <SelectTrigger className="w-full lg:w-40">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="highest">Highest Rating</SelectItem>
              <SelectItem value="lowest">Lowest Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {result.items.length === 0 ? (
          <div className="p-6">
            <AdminEmptyState icon={Star} title="No reviews found" description="Try adjusting your search or filters." />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>
                    <Link
                      href={ROUTES.product(review.product.slug)}
                      className="flex items-center gap-2 font-medium text-text-primary hover:text-blush-hover"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- may be a Cloudinary or legacy URL */}
                      <img src={review.product.thumbnail} alt="" className="size-9 shrink-0 rounded-lg object-cover" />
                      <span className="line-clamp-2 max-w-40">{review.product.name}</span>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-text-primary">
                        {review.user.firstName} {review.user.lastName}
                      </span>
                      <span className="text-xs text-text-muted">{review.user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <RatingStars rating={review.rating} />
                  </TableCell>
                  <TableCell className="max-w-56">
                    <p className="line-clamp-1 font-medium text-text-primary">{review.title}</p>
                    <p className="line-clamp-1 text-xs text-text-muted">{review.comment}</p>
                    {review.images.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setViewingImages(review)}
                        className="mt-0.5 text-xs font-medium text-blush-hover hover:text-text-primary"
                      >
                        {review.images.length} photo{review.images.length === 1 ? "" : "s"}
                      </button>
                    )}
                  </TableCell>
                  <TableCell className="text-text-muted">{formatDate(review.createdAt)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        review.isHidden
                          ? "border-transparent bg-danger/15 text-danger"
                          : "border-transparent bg-success/15 text-success"
                      }
                    >
                      {review.isHidden ? "Hidden" : "Visible"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                        <MoreHorizontal className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem disabled={updatingId === review.id} onClick={() => handleToggleHidden(review)}>
                          {review.isHidden ? <Eye /> : <EyeOff />}
                          {review.isHidden ? "Unhide" : "Hide"}
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onClick={() => setDeleting(review)}>
                          <Trash2 /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {result.totalPages > 1 && (
          <div className="border-t border-divider p-4">
            <Pagination currentPage={result.page} totalPages={result.totalPages} onPageChange={handlePageChange} />
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete review?"
        description="This review and its photos will be permanently removed."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />

      {viewingImages && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Review photos"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setViewingImages(null)}
        >
          <div className="flex max-w-2xl flex-wrap gap-3" onClick={(event) => event.stopPropagation()}>
            {viewingImages.images.map((image) => (
              // eslint-disable-next-line @next/next/no-img-element -- Cloudinary review photo, full-size lightbox view
              <img key={image.id} src={image.imageUrl} alt="Customer photo" className="max-h-80 rounded-lg object-contain" />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
