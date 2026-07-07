"use client";

import { useMemo, useState } from "react";
import { Layers, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminSubCategoryService } from "@/features/admin/services/adminSubCategory.service";
import { SubCategoryFormDialog } from "@/features/admin/components/SubCategoryFormDialog";
import type { IAdminSubCategory } from "@/types/admin";
import type { ICategory } from "@/types/product";

export function SubCategoriesClient({
  initialSubCategories,
  categories,
}: {
  initialSubCategories: IAdminSubCategory[];
  categories: ICategory[];
}) {
  const [subCategories, setSubCategories] = useState(initialSubCategories);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<IAdminSubCategory | null>(null);
  const [deleting, setDeleting] = useState<IAdminSubCategory | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return subCategories.filter((subCategory) => {
      const matchesSearch = !query || subCategory.name.toLowerCase().includes(query);
      const matchesCategory = categoryFilter === "all" || subCategory.categoryId === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [subCategories, search, categoryFilter]);

  function handleSaved(saved: IAdminSubCategory) {
    setSubCategories((prev) => {
      const exists = prev.some((subCategory) => subCategory.id === saved.id);
      return exists ? prev.map((subCategory) => (subCategory.id === saved.id ? saved : subCategory)) : [saved, ...prev];
    });
  }

  async function handleDelete() {
    if (!deleting) return;
    const result = await adminSubCategoryService.remove(deleting.id);
    if (!result.success) {
      toast.error(result.message || "Could not delete subcategory.");
      return;
    }
    toast.success("Subcategory deleted.");
    setSubCategories((prev) => prev.filter((subCategory) => subCategory.id !== deleting.id));
    setDeleting(null);
  }

  return (
    <>
      <AdminPageHeader
        title="Subcategories"
        description="Manage subcategories nested under each category."
        breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Subcategories" }]}
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus /> Add Subcategory
          </Button>
        }
      />

      <Card className="p-0">
        <div className="flex flex-col gap-3 border-b border-divider p-4 sm:flex-row sm:items-center">
          <div className="relative max-w-xs flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search subcategories…"
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value ?? "all")}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <div className="p-6">
            <AdminEmptyState
              icon={Layers}
              title={subCategories.length === 0 ? "No subcategories yet" : "No matches"}
              description={
                subCategories.length === 0
                  ? "Create your first subcategory to get started."
                  : "Try a different search or filter."
              }
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subcategory</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((subCategory) => (
                <TableRow key={subCategory.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {subCategory.image ? (
                        // eslint-disable-next-line @next/next/no-img-element -- admin-entered arbitrary URL
                        <img src={subCategory.image} alt="" className="size-9 rounded-lg object-cover" />
                      ) : (
                        <div className="flex size-9 items-center justify-center rounded-lg bg-blush-light">
                          <Layers className="size-4 text-blush-hover" />
                        </div>
                      )}
                      <span className="font-medium text-text-primary">{subCategory.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-text-muted">{subCategory.category.name}</TableCell>
                  <TableCell className="text-text-muted">{subCategory.slug}</TableCell>
                  <TableCell>{subCategory._count.products}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        subCategory.isActive
                          ? "border-transparent bg-success/15 text-success"
                          : "border-transparent bg-muted text-text-muted"
                      }
                    >
                      {subCategory.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Edit ${subCategory.name}`}
                        onClick={() => {
                          setEditing(subCategory);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Delete ${subCategory.name}`}
                        onClick={() => setDeleting(subCategory)}
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

      <SubCategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        subCategory={editing}
        categories={categories}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete subcategory?"
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
