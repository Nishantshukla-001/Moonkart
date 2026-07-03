"use client";

import { createClient } from "@/lib/supabase/client";
import type {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "@/features/auth/validation/auth.schema";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

async function postJson<T>(url: string, body: unknown): Promise<ApiResponse<T>> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return response.json();
}

async function putJson<T>(url: string, body: unknown): Promise<ApiResponse<T>> {
  const response = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return response.json();
}

export const authService = {
  register(input: RegisterInput) {
    return postJson("/api/auth/register", input);
  },
  login(input: LoginInput) {
    return postJson("/api/auth/login", input);
  },
  logout() {
    return postJson("/api/auth/logout", {});
  },
  forgotPassword(input: ForgotPasswordInput) {
    return postJson("/api/auth/forgot-password", input);
  },
  resetPassword(input: ResetPasswordInput) {
    return postJson("/api/auth/reset-password", input);
  },
  resendVerification(email: string) {
    return postJson("/api/auth/verify-email", { email });
  },
  changePassword(input: ChangePasswordInput) {
    return putJson("/api/profile/password", input);
  },
  /**
   * Google OAuth must be initiated client-side — it redirects the whole
   * page to Google's consent screen (docs/API.md: "handled directly by the
   * Supabase Auth client SDK, no custom /api/auth/google route required").
   */
  async signInWithGoogle(redirectPath = "/") {
    const supabase = createClient();
    const origin = window.location.origin;

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`,
      },
    });
  },
};
