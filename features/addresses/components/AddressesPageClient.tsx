"use client";

import { useState } from "react";
import { MapPin, Plus } from "lucide-react";
import { toast } from "sonner";

import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { AddressCard } from "@/features/addresses/components/AddressCard";
import { AddressFormDialog } from "@/features/addresses/components/AddressFormDialog";
import type { IAddress } from "@/types/address";

export function AddressesPageClient({ addresses: initialAddresses }: { addresses: IAddress[] }) {
  const [addresses, setAddresses] = useState<IAddress[]>(initialAddresses);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<IAddress | null>(null);
  const [deleting, setDeleting] = useState<IAddress | null>(null);

  async function reload() {
    const response = await fetch("/api/addresses", { cache: "no-store" });
    const result = await response.json();
    setAddresses(result.data ?? []);
  }

  function handleSaved(address: IAddress) {
    setAddresses((current) => {
      const withoutSaved = current.filter((item) => item.id !== address.id);
      const next = address.isDefault
        ? withoutSaved.map((item) => ({ ...item, isDefault: false }))
        : withoutSaved;
      return [address, ...next].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
    });
  }

  async function handleSetDefault(address: IAddress) {
    const response = await fetch(`/api/addresses/${address.id}/default`, { method: "PUT" });
    const result = await response.json();
    if (!result.success) {
      toast.error(result.message || "Could not update default address.");
      return;
    }
    toast.success("Default address updated.");
    reload();
  }

  async function handleDelete() {
    if (!deleting) return;
    const response = await fetch(`/api/addresses/${deleting.id}`, { method: "DELETE" });
    const result = await response.json();
    if (!result.success) {
      toast.error(result.message || "Could not delete address.");
      return;
    }
    toast.success("Address deleted.");
    setDeleting(null);
    reload();
  }

  return (
    <Container className="flex flex-col gap-8 py-10 sm:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Breadcrumb
            items={[{ label: "Home", href: "/" }, { label: "My Account", href: "/account" }, { label: "Addresses" }]}
          />
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-text-primary sm:text-[32px]">
            My Addresses
          </h1>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="w-full sm:w-fit"
        >
          <Plus /> Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No saved addresses"
          description="Add a delivery address to speed up checkout."
          actionLabel="Add Address"
          onAction={() => setFormOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={() => {
                setEditing(address);
                setFormOpen(true);
              }}
              onDelete={() => setDeleting(address)}
              onSetDefault={() => handleSetDefault(address)}
            />
          ))}
        </div>
      )}

      <AddressFormDialog open={formOpen} onOpenChange={setFormOpen} address={editing} onSaved={handleSaved} />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete address?"
        description="This address will be permanently removed from your account."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </Container>
  );
}
