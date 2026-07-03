"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface NewsletterFormProps {
  variant?: "compact" | "large";
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

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex gap-2",
        variant === "large" && "mx-auto w-full max-w-md flex-col sm:flex-row",
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
        className={variant === "large" ? "h-12 bg-background" : "h-10"}
      />
      <Button
        type="submit"
        size={variant === "large" ? "default" : "sm"}
        className="shrink-0"
      >
        Subscribe
      </Button>
    </form>
  );
}
