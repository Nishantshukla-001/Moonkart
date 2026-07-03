import type { Metadata } from "next";
import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your MoonKart account password.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      heading="Forgot Password?"
      subheading="Enter your email and we'll send you a reset link."
      footer={
        <Link
          href={ROUTES.login}
          className="font-semibold text-blush-hover transition-colors hover:text-text-primary"
        >
          Back to Login
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
