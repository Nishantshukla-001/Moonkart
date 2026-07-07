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
import { Textarea } from "@/components/ui/textarea";
import { adminBrandService } from "@/features/admin/services/adminBrand.service";
import { brandSchema, type BrandInput } from "@/features/categories/validation/brand.schema";
import { generateSlug } from "@/utils/generateSlug";
import type { IAdminBrand } from "@/types/admin";

interface BrandFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand?: IAdminBrand | null;
  onSaved: (brand: IAdminBrand) => void;
}

const emptyDefaults: BrandInput = { name: "", slug: "", logo: "", description: "", isActive: true };

export function BrandFormDialog({ open, onOpenChange, brand, onSaved }: BrandFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  const form = useForm<BrandInput>({
    resolver: zodResolver(brandSchema),
    defaultValues: emptyDefaults,
  });

  useEffect(() => {
    if (!open) return;
    setSlugTouched(!!brand);
    form.reset(
      brand
        ? {
            name: brand.name,
            slug: brand.slug,
            logo: brand.logo ?? "",
            description: brand.description ?? "",
            isActive: brand.isActive,
          }
        : emptyDefaults
    );
  }, [open, brand, form]);

  function handleNameChange(value: string) {
    form.setValue("name", value);
    if (!slugTouched) {
      form.setValue("slug", generateSlug(value), { shouldValidate: true });
    }
  }

  async function onSubmit(values: BrandInput) {
    setIsSubmitting(true);
    const result = brand
      ? await adminBrandService.update(brand.id, values)
      : await adminBrandService.create(values);
    setIsSubmitting(false);

    if (!result.success || !result.data) {
      toast.error(result.message || "Something went wrong.");
      return;
    }

    toast.success(brand ? "Brand updated." : "Brand created.");
    onSaved(result.data);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{brand ? "Edit Brand" : "Add Brand"}</DialogTitle>
          <DialogDescription>
            {brand ? "Update this brand's details." : "Create a new product brand."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} onChange={(event) => handleNameChange(event.target.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(event) => {
                        setSlugTouched(true);
                        field.onChange(event);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <div className="flex items-center justify-between rounded-lg border border-border-light px-3.5 py-3">
                  <Label htmlFor="brand-active" className="font-normal text-text-primary">
                    Active
                  </Label>
                  <Switch id="brand-active" checked={field.value} onCheckedChange={field.onChange} />
                </div>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : brand ? "Save Changes" : "Create Brand"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
