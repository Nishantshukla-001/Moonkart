"use client";

import { useState } from "react";
import { MailCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/features/auth/services/auth.service";

export function VerifyEmailNotice() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleResend() {
    if (!email) {
      toast.error("Enter your email to resend the verification link.");
      return;
    }
    setIsSubmitting(true);
    const result = await authService.resendVerification(email);
    setIsSubmitting(false);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex size-16 items-center justify-center rounded-full bg-blush-light">
        <MailCheck className="size-7 text-blush-hover" aria-hidden="true" />
      </div>
      <p className="text-center text-sm leading-[160%] text-text-secondary">
        We&apos;ve sent a verification link to your email address. Click it to activate your
        account.
      </p>
      <div className="flex w-full flex-col gap-2">
        <Label htmlFor="resend-email">Didn&apos;t get it? Resend to:</Label>
        <div className="flex gap-2">
          <Input
            id="resend-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={handleResend}
            disabled={isSubmitting}
            className="shrink-0"
          >
            Resend
          </Button>
        </div>
      </div>
    </div>
  );
}
