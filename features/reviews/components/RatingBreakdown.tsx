import { RatingStars } from "@/features/reviews/components/RatingStars";
import type { IRatingBreakdown } from "@/types/review";

export function RatingBreakdown({ breakdown }: { breakdown: IRatingBreakdown }) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-10">
      <div className="flex flex-col items-center gap-1.5 sm:items-start">
        <span className="font-heading text-4xl font-bold text-text-primary">{breakdown.average.toFixed(1)}</span>
        <RatingStars rating={breakdown.average} size="md" />
        <p className="text-sm text-text-muted">
          {breakdown.total} review{breakdown.total === 1 ? "" : "s"}
        </p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-1.5">
        {([5, 4, 3, 2, 1] as const).map((star) => {
          const count = breakdown.counts[star];
          const percent = breakdown.total > 0 ? (count / breakdown.total) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-2 text-xs text-text-secondary">
              <span className="w-10 shrink-0">{star} star</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg-section">
                <div className="h-full rounded-full bg-warning" style={{ width: `${percent}%` }} />
              </div>
              <span className="w-6 shrink-0 text-right text-text-muted">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
