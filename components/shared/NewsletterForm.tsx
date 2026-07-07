"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface NewsletterFormProps {
  /**
   * - `compact`: always a single row (tight inline placements).
   * - `large`: stacks below the `sm` viewport breakpoint, row from `sm` up —
   *   only correct when the form's container is full-width at that
   *   breakpoint (e.g. the homepage promo section).
   * - `stacked`: always a column, regardless of viewport — for narrow
   *   containers (e.g. a footer sidebar column) where "large"'s viewport-based
   *   switch would wrongly go horizontal while the container itself stays
   *   narrow, cramming the input and button together.
   */
  variant?: "compact" | "large" | "stacked";
  onSubscribe?: (email: string) => void;
  className?: string;
}

export function NewsletterForm({
  variant = "compact",
  onSubscribe,
  className,
}: NewsletterFormProps) {
  const [email, setEmail] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email) return;
    onSubscribe?.(email);
    toast.success("You're subscribed! Welcome to MoonKart.");
    setEmail("");
  }

  const isLarge = variant === "large" || variant === "stacked";

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex gap-2",
        variant === "large" && "mx-auto w-full max-w-md flex-col sm:flex-row",
        variant === "stacked" && "w-full flex-col",
        className
      )}
    >
      <Input
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Your email address"
        aria-label="Email address"
        className={isLarge ? "h-12 bg-background" : "h-10"}
      />
      <Button type="submit" size={isLarge ? "default" : "sm"} className="shrink-0">
        Subscribe
      </Button>
    </form>
  );
}
