import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnnouncementForm } from "@/features/admin/components/AnnouncementForm";
import { StoreSettingsForm } from "@/features/admin/components/StoreSettingsForm";
import { getStoreSettings } from "@/features/admin/services/storeSettings.service";
import { ProfileForm } from "@/features/auth/components/ProfileForm";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const [user, storeSettings] = await Promise.all([requireAdmin(), getStoreSettings()]);

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
            <CardTitle>Send Announcement</CardTitle>
            <CardDescription>Notify every customer via their in-app notification center.</CardDescription>
          </CardHeader>
          <CardContent>
            <AnnouncementForm />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Store Settings</CardTitle>
          <CardDescription>
            General store, branding, contact, social, currency, and shipping/tax placeholders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StoreSettingsForm settings={storeSettings} />
        </CardContent>
      </Card>
    </>
  );
}
