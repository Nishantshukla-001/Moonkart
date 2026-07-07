"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { adminProductService } from "@/features/admin/services/adminProduct.service";
import { productVariantSchema, type ProductVariantInput } from "@/features/products/validation/product.schema";
import type { IProductVariant } from "@/types/product";

interface VariantFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  variant?: IProductVariant | null;
  onSaved: (variant: IProductVariant) => void;
}

const emptyDefaults: ProductVariantInput = {
  size: "",
  color: "",
  sku: "",
  price: undefined,
  salePrice: undefined,
  stock: 0,
  image: "",
  isDefault: false,
};

export function VariantFormDialog({ open, onOpenChange, productId, variant, onSaved }: VariantFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProductVariantInput>({
    resolver: zodResolver(productVariantSchema),
    defaultValues: emptyDefaults,
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      variant
        ? {
            size: variant.size ?? "",
            color: variant.color ?? "",
            sku: variant.sku ?? "",
            price: variant.price ?? undefined,
            salePrice: variant.salePrice ?? undefined,
            stock: variant.stock,
            image: variant.image ?? "",
            isDefault: variant.isDefault,
          }
        : emptyDefaults
    );
  }, [open, variant, form]);

  async function onSubmit(values: ProductVariantInput) {
    setIsSubmitting(true);
    const result = variant
      ? await adminProductService.updateVariant(productId, variant.id, values)
      : await adminProductService.addVariant(productId, values);
    setIsSubmitting(false);

    if (!result.success || !result.data) {
      toast.error(result.message || "Something went wrong.");
      return;
    }

    toast.success(variant ? "Variant updated." : "Variant added.");
    onSaved(result.data);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{variant ? "Edit Variant" : "Add Variant"}</DialogTitle>
          <DialogDescription>
            Variants let customers pick a size/color combination with its own stock and optional price.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Size</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. M" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Black" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Override</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Uses base price"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(event) => field.onChange(event.target.value ? Number(event.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="salePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sale Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Optional"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(event) => field.onChange(event.target.value ? Number(event.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(event) => field.onChange(Number(event.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variant Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://… (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isDefault"
              render={({ field }) => (
                <div className="flex items-center justify-between rounded-lg border border-border-light px-3.5 py-3">
                  <Label htmlFor="variant-default" className="font-normal text-text-primary">
                    Default variant
                  </Label>
                  <Switch id="variant-default" checked={field.value} onCheckedChange={field.onChange} />
                </div>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : variant ? "Save Changes" : "Add Variant"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
