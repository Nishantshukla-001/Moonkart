import type { Metadata } from "next";
import { Users } from "lucide-react";

import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Customers" };

export default function AdminCustomersPage() {
  return (
    <>
      <AdminPageHeader
        title="Customers"
        description="View and manage customer accounts."
        breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Customers" }]}
      />
      <Card className="p-6">
        <AdminEmptyState
          icon={Users}
          title="Customer management is coming soon"
          description="A full customer directory with order history will appear here in a later phase."
        />
      </Card>
    </>
  );
}
