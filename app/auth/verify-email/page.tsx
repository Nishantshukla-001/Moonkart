import type { Metadata } from "next";
import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { VerifyEmailNotice } from "@/features/auth/components/VerifyEmailNotice";

export const metadata: Metadata = {
  title: "Verify Your Email",
  description: "Verify your MoonKart account email address.",
};

export default function VerifyEmailPage() {
  return (
    <AuthCard
      heading="Check Your Email"
      footer={
        <Link
          href={ROUTES.login}
          className="font-semibold text-blush-hover transition-colors hover:text-text-primary"
        >
          Back to Login
        </Link>
      }
    >
      <VerifyEmailNotice />
    </AuthCard>
  );
}
