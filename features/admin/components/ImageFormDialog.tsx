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
import { adminProductService } from "@/features/admin/services/adminProduct.service";
import { productImageSchema, type ProductImageInput } from "@/features/products/validation/product.schema";
import type { IProductImage } from "@/types/product";

interface ImageFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  onSaved: (image: IProductImage) => void;
}

export function ImageFormDialog({ open, onOpenChange, productId, onSaved }: ImageFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProductImageInput>({
    resolver: zodResolver(productImageSchema),
    defaultValues: { imageUrl: "" },
  });

  useEffect(() => {
    if (open) form.reset({ imageUrl: "" });
  }, [open, form]);

  const imageUrl = form.watch("imageUrl");

  async function onSubmit(values: ProductImageInput) {
    setIsSubmitting(true);
    const result = await adminProductService.addImage(productId, values);
    setIsSubmitting(false);

    if (!result.success || !result.data) {
      toast.error(result.message || "Could not add image.");
      return;
    }

    toast.success("Image added.");
    onSaved(result.data);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Image</DialogTitle>
          <DialogDescription>Paste a hosted image URL. Cloudinary upload is coming later.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {imageUrl && (
              <div className="overflow-hidden rounded-lg border border-border-light">
                {/* eslint-disable-next-line @next/next/no-img-element -- live preview of an arbitrary admin-entered URL */}
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="aspect-square w-full object-cover"
                  onError={(event) => (event.currentTarget.style.display = "none")}
                  onLoad={(event) => (event.currentTarget.style.display = "block")}
                />
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding…" : "Add Image"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
