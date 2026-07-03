import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { ROUTES } from "@/constants/routes";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your MoonKart account.",
};

export default function LoginPage() {
  return (
    <AuthCard
      heading="Welcome Back"
      subheading="Login to continue your MoonKart experience."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href={ROUTES.signup}
            className="font-semibold text-blush-hover transition-colors hover:text-text-primary"
          >
            Sign up
          </Link>
        </>
      }
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
