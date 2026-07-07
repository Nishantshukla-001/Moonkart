"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Tags, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminBrandService } from "@/features/admin/services/adminBrand.service";
import { BrandFormDialog } from "@/features/admin/components/BrandFormDialog";
import type { IAdminBrand } from "@/types/admin";

export function BrandsClient({ initialBrands }: { initialBrands: IAdminBrand[] }) {
  const [brands, setBrands] = useState(initialBrands);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<IAdminBrand | null>(null);
  const [deleting, setDeleting] = useState<IAdminBrand | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return brands;
    return brands.filter((brand) => brand.name.toLowerCase().includes(query));
  }, [brands, search]);

  function handleSaved(saved: IAdminBrand) {
    setBrands((prev) => {
      const exists = prev.some((brand) => brand.id === saved.id);
      return exists ? prev.map((brand) => (brand.id === saved.id ? saved : brand)) : [saved, ...prev];
    });
  }

  async function handleDelete() {
    if (!deleting) return;
    const result = await adminBrandService.remove(deleting.id);
    if (!result.success) {
      toast.error(result.message || "Could not delete brand.");
      return;
    }
    toast.success("Brand deleted.");
    setBrands((prev) => prev.filter((brand) => brand.id !== deleting.id));
    setDeleting(null);
  }

  return (
    <>
      <AdminPageHeader
        title="Brands"
        description="Manage the brands sold on MoonKart."
        breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Brands" }]}
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus /> Add Brand
          </Button>
        }
      />

      <Card className="p-0">
        <div className="border-b border-divider p-4">
          <div className="relative max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search brands…"
              className="pl-9"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-6">
            <AdminEmptyState
              icon={Tags}
              title={brands.length === 0 ? "No brands yet" : "No matches"}
              description={
                brands.length === 0 ? "Create your first brand to get started." : "Try a different search term."
              }
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brand</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {brand.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element -- admin-entered arbitrary URL
                        <img src={brand.logo} alt="" className="size-9 rounded-lg object-cover" />
                      ) : (
                        <div className="flex size-9 items-center justify-center rounded-lg bg-blush-light">
                          <Tags className="size-4 text-blush-hover" />
                        </div>
                      )}
                      <span className="font-medium text-text-primary">{brand.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-text-muted">{brand.slug}</TableCell>
                  <TableCell>{brand._count.products}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        brand.isActive
                          ? "border-transparent bg-success/15 text-success"
                          : "border-transparent bg-muted text-text-muted"
                      }
                    >
                      {brand.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Edit ${brand.name}`}
                        onClick={() => {
                          setEditing(brand);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Delete ${brand.name}`}
                        onClick={() => setDeleting(brand)}
                      >
                        <Trash2 className="size-4 text-danger" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <BrandFormDialog open={formOpen} onOpenChange={setFormOpen} brand={editing} onSaved={handleSaved} />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete brand?"
        description={
          deleting?._count.products
            ? `"${deleting.name}" has ${deleting._count.products} product(s) and cannot be deleted until they're moved or removed.`
            : `This will permanently delete "${deleting?.name}". This cannot be undone.`
        }
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </>
  );
}
