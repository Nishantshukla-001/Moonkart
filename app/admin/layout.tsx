import type { Metadata } from "next";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: { template: "%s | Admin", default: "Admin Dashboard" },
  robots: { index: false, follow: false },
};

/**
 * Single enforcement point for every /admin/** route — middleware.ts is only
 * an advisory first pass (see its comments), so this Server Component is the
 * authoritative RBAC check. Nested pages don't need to repeat it.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <div className="min-h-screen bg-bg-dashboard">
      <AdminSidebar />
      <div className="flex min-h-screen flex-col lg:pl-64">
        <AdminTopbar user={user} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
