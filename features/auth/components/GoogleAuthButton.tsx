"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/shared/GoogleIcon";
import { authService } from "@/features/auth/services/auth.service";

interface GoogleAuthButtonProps {
  label?: string;
  redirectPath?: string;
}

export function GoogleAuthButton({
  label = "Continue with Google",
  redirectPath = "/",
}: GoogleAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    setIsLoading(true);
    try {
      await authService.signInWithGoogle(redirectPath);
    } catch {
      toast.error("Could not start Google sign-in. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleClick}
      disabled={isLoading}
    >
      <GoogleIcon className="size-4" />
      {label}
    </Button>
  );
}
