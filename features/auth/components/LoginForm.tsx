"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants/routes";
import { GoogleAuthButton } from "@/features/auth/components/GoogleAuthButton";
import { authService } from "@/features/auth/services/auth.service";
import { loginSchema, type LoginInput } from "@/features/auth/validation/auth.schema";
import { useAuth } from "@/hooks/useAuth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshProfile } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: true },
  });

  async function onSubmit(values: LoginInput) {
    setFormError(null);
    setIsSubmitting(true);

    const result = await authService.login(values);

    if (!result.success) {
      setFormError(result.message);
      setIsSubmitting(false);
      return;
    }

    await refreshProfile();
    toast.success("Welcome back!");
    router.push(searchParams.get("redirectTo") || ROUTES.home);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      {formError && (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" autoComplete="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link
                    href={ROUTES.forgotPassword}
                    className="text-sm font-medium text-blush-hover transition-colors hover:text-text-primary"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id="rememberMe"
                />
                <Label htmlFor="rememberMe" className="cursor-pointer font-normal text-text-secondary">
                  Remember me
                </Label>
              </div>
            )}
          />

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
        </form>
      </Form>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border-light" />
        <span className="text-xs font-medium tracking-[0.3px] text-text-muted uppercase">or</span>
        <span className="h-px flex-1 bg-border-light" />
      </div>

      <GoogleAuthButton label="Continue with Google" redirectPath={searchParams.get("redirectTo") || "/"} />
    </div>
  );
}
