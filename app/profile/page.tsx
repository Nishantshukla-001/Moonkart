import type { Metadata } from "next";

import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/card";
import { ChangePasswordForm } from "@/features/auth/components/ChangePasswordForm";
import { ProfileForm } from "@/features/auth/components/ProfileForm";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "My Profile",
  description: "Manage your MoonKart account details.",
};

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <Container className="flex flex-col gap-8 py-12 sm:py-16">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-[32px]">
          My Profile
        </h1>
        <p className="text-base text-text-secondary">
          Manage your personal information and account security.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card className="p-6 sm:p-8">
          <h2 className="mb-6 font-heading text-xl font-semibold text-text-primary">
            Personal Information
          </h2>
          <ProfileForm user={user} />
        </Card>

        <Card className="p-6 sm:p-8">
          <h2 className="mb-6 font-heading text-xl font-semibold text-text-primary">
            Change Password
          </h2>
          {user.authProvider === "EMAIL" ? (
            <ChangePasswordForm />
          ) : (
            <p className="text-sm leading-[160%] text-text-secondary">
              You signed in with Google, so password management isn&apos;t available for this
              account.
            </p>
          )}
        </Card>
      </div>
    </Container>
  );
}
