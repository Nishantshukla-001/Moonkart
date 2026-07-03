import type { Metadata } from "next";
import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { SignupForm } from "@/features/auth/components/SignupForm";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your MoonKart account.",
};

export default function SignupPage() {
  return (
    <AuthCard
      heading="Create Your Account"
      subheading="Join MoonKart for a premium shopping experience."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href={ROUTES.login}
            className="font-semibold text-blush-hover transition-colors hover:text-text-primary"
          >
            Login
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthCard>
  );
}
