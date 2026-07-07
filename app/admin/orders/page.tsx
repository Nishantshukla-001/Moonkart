import type { Metadata } from "next";
import { ShoppingCart } from "lucide-react";

import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Orders" };

export default function AdminOrdersPage() {
  return (
    <>
      <AdminPageHeader
        title="Orders"
        description="Track and fulfill customer orders."
        breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Orders" }]}
      />
      <Card className="p-6">
        <AdminEmptyState
          icon={ShoppingCart}
          title="Orders are coming soon"
          description="Order management will appear here once checkout and payments (Razorpay) ship in a later phase."
        />
      </Card>
    </>
  );
}
