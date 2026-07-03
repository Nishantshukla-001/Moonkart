import type { Metadata } from "next";

import { AuthCard } from "@/features/auth/components/AuthCard";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new password for your MoonKart account.",
};

export default function ResetPasswordPage() {
  return (
    <AuthCard heading="Reset Password" subheading="Enter a new password for your account.">
      <ResetPasswordForm />
    </AuthCard>
  );
}
