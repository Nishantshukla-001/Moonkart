"use client";

import { useState } from "react";
import { Boxes, CheckCircle2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminProductService } from "@/features/admin/services/adminProduct.service";
import { VariantFormDialog } from "@/features/admin/components/VariantFormDialog";
import { formatCurrency } from "@/utils/formatCurrency";
import type { IProductVariant } from "@/types/product";

export function VariantsManager({
  productId,
  initialVariants,
}: {
  productId: string;
  initialVariants: IProductVariant[];
}) {
  const [variants, setVariants] = useState(initialVariants);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<IProductVariant | null>(null);
  const [deleting, setDeleting] = useState<IProductVariant | null>(null);

  async function handleSaved(saved: IProductVariant) {
    let next = variants.some((variant) => variant.id === saved.id)
      ? variants.map((variant) => (variant.id === saved.id ? saved : variant))
      : [...variants, saved];

    if (saved.isDefault) {
      const othersToUnset = next.filter((variant) => variant.id !== saved.id && variant.isDefault);
      if (othersToUnset.length > 0) {
        await Promise.all(
          othersToUnset.map((variant) =>
            adminProductService.updateVariant(productId, variant.id, { isDefault: false })
          )
        );
        next = next.map((variant) => (variant.id === saved.id ? variant : { ...variant, isDefault: false }));
      }
    }

    setVariants(next);
  }

  async function handleDelete() {
    if (!deleting) return;
    const result = await adminProductService.removeVariant(productId, deleting.id);
    if (!result.success) {
      toast.error(result.message || "Could not delete variant.");
      return;
    }
    toast.success("Variant deleted.");
    setVariants((prev) => prev.filter((variant) => variant.id !== deleting.id));
    setDeleting(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          Add size/color combinations with their own stock and optional price overrides.
        </p>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus /> Add Variant
        </Button>
      </div>

      {variants.length === 0 ? (
        <AdminEmptyState
          icon={Boxes}
          title="No variants yet"
          description="Add variants if this product comes in multiple sizes or colors."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Size</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Default</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((variant) => (
              <TableRow key={variant.id}>
                <TableCell>{variant.size || "—"}</TableCell>
                <TableCell>{variant.color || "—"}</TableCell>
                <TableCell className="text-text-muted">{variant.sku || "—"}</TableCell>
                <TableCell>
                  {variant.price ? (
                    <div className="flex flex-col">
                      <span className="font-medium text-text-primary">
                        {formatCurrency(variant.salePrice ?? variant.price)}
                      </span>
                      {variant.salePrice && (
                        <span className="text-xs text-text-muted line-through">
                          {formatCurrency(variant.price)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-text-muted">Base price</span>
                  )}
                </TableCell>
                <TableCell>{variant.stock}</TableCell>
                <TableCell>
                  {variant.isDefault && (
                    <Badge variant="outline" className="border-transparent bg-blush-light text-blush-hover">
                      <CheckCircle2 /> Default
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Edit variant"
                      onClick={() => {
                        setEditing(variant);
                        setFormOpen(true);
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Delete variant"
                      onClick={() => setDeleting(variant)}
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

      <VariantFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        productId={productId}
        variant={editing}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete variant?"
        description="This will permanently remove this variant. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}
