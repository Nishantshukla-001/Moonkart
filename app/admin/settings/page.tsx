import type { Metadata } from "next";
import { Globe, Mail, Store } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { siteConfig } from "@/constants/config";
import { ProfileForm } from "@/features/auth/components/ProfileForm";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const user = await requireAdmin();

  return (
    <>
      <AdminPageHeader
        title="Settings"
        description="Manage your admin account and store information."
        breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Settings" }]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Your Account</CardTitle>
            <CardDescription>Update the personal details tied to your admin login.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm user={user} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
            <CardDescription>Configured in the app&apos;s environment — read only.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <Store className="mt-0.5 size-4 shrink-0 text-text-muted" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-text-primary">{siteConfig.name}</p>
                <p className="text-xs text-text-muted">Store name</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Globe className="mt-0.5 size-4 shrink-0 text-text-muted" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-text-primary break-all">{siteConfig.url}</p>
                <p className="text-xs text-text-muted">Site URL</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-text-muted" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-text-primary break-all">{user.email}</p>
                <p className="text-xs text-text-muted">Admin contact email</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
