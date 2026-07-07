"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminCategoryService } from "@/features/admin/services/adminCategory.service";
import { CategoryFormDialog } from "@/features/admin/components/CategoryFormDialog";
import type { IAdminCategory } from "@/types/admin";

export function CategoriesClient({ initialCategories }: { initialCategories: IAdminCategory[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<IAdminCategory | null>(null);
  const [deleting, setDeleting] = useState<IAdminCategory | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return categories;
    return categories.filter((category) => category.name.toLowerCase().includes(query));
  }, [categories, search]);

  function handleSaved(saved: IAdminCategory) {
    setCategories((prev) => {
      const exists = prev.some((category) => category.id === saved.id);
      return exists ? prev.map((category) => (category.id === saved.id ? { ...category, ...saved } : category)) : [saved, ...prev];
    });
  }

  async function handleDelete() {
    if (!deleting) return;
    const result = await adminCategoryService.remove(deleting.id);
    if (!result.success) {
      toast.error(result.message || "Could not delete category.");
      return;
    }
    toast.success("Category deleted.");
    setCategories((prev) => prev.filter((category) => category.id !== deleting.id));
    setDeleting(null);
  }

  return (
    <>
      <AdminPageHeader
        title="Categories"
        description="Organize your product catalog into categories."
        breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Categories" }]}
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus /> Add Category
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
              placeholder="Search categories…"
              className="pl-9"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-6">
            <AdminEmptyState
              icon={LayoutGrid}
              title={categories.length === 0 ? "No categories yet" : "No matches"}
              description={
                categories.length === 0
                  ? "Create your first category to start organizing products."
                  : "Try a different search term."
              }
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Subcategories</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {category.image ? (
                        // eslint-disable-next-line @next/next/no-img-element -- admin-entered arbitrary URL
                        <img src={category.image} alt="" className="size-9 rounded-lg object-cover" />
                      ) : (
                        <div className="flex size-9 items-center justify-center rounded-lg bg-blush-light">
                          <LayoutGrid className="size-4 text-blush-hover" />
                        </div>
                      )}
                      <span className="font-medium text-text-primary">{category.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-text-muted">{category.slug}</TableCell>
                  <TableCell>{category._count.subCategories}</TableCell>
                  <TableCell>{category._count.products}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        category.isActive
                          ? "border-transparent bg-success/15 text-success"
                          : "border-transparent bg-muted text-text-muted"
                      }
                    >
                      {category.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Edit ${category.name}`}
                        onClick={() => {
                          setEditing(category);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Delete ${category.name}`}
                        onClick={() => setDeleting(category)}
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

      <CategoryFormDialog open={formOpen} onOpenChange={setFormOpen} category={editing} onSaved={handleSaved} />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete category?"
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
