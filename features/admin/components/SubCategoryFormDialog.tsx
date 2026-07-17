"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { CloudinaryUploader } from "@/components/shared/CloudinaryUploader";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { adminSubCategoryService } from "@/features/admin/services/adminSubCategory.service";
import {
  subCategorySchema,
  type SubCategoryInput,
} from "@/features/categories/validation/subCategory.schema";
import { generateSlug } from "@/utils/generateSlug";
import type { IAdminSubCategory } from "@/types/admin";
import type { ICategory } from "@/types/product";

interface SubCategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subCategory?: IAdminSubCategory | null;
  categories: ICategory[];
  onSaved: (subCategory: IAdminSubCategory) => void;
}

const emptyDefaults: SubCategoryInput = {
  categoryId: "",
  name: "",
  slug: "",
  image: "",
  description: "",
  isActive: true,
};

export function SubCategoryFormDialog({
  open,
  onOpenChange,
  subCategory,
  categories,
  onSaved,
}: SubCategoryFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  const form = useForm<SubCategoryInput>({
    resolver: zodResolver(subCategorySchema),
    defaultValues: emptyDefaults,
  });

  useEffect(() => {
    if (!open) return;
    setSlugTouched(!!subCategory);
    form.reset(
      subCategory
        ? {
            categoryId: subCategory.categoryId,
            name: subCategory.name,
            slug: subCategory.slug,
            image: subCategory.image ?? "",
            description: subCategory.description ?? "",
            isActive: subCategory.isActive,
          }
        : emptyDefaults
    );
  }, [open, subCategory, form]);

  function handleNameChange(value: string) {
    form.setValue("name", value);
    if (!slugTouched) {
      form.setValue("slug", generateSlug(value), { shouldValidate: true });
    }
  }

  async function onSubmit(values: SubCategoryInput) {
    setIsSubmitting(true);
    const result = subCategory
      ? await adminSubCategoryService.update(subCategory.id, values)
      : await adminSubCategoryService.create(values);
    setIsSubmitting(false);

    if (!result.success || !result.data) {
      toast.error(result.message || "Something went wrong.");
      return;
    }

    toast.success(subCategory ? "Subcategory updated." : "Subcategory created.");
    onSaved(result.data);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{subCategory ? "Edit Subcategory" : "Add Subcategory"}</DialogTitle>
          <DialogDescription>
            {subCategory ? "Update this subcategory's details." : "Create a new subcategory under a category."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subcategory Image</FormLabel>
                  {field.value && (
                    // eslint-disable-next-line @next/next/no-img-element -- Cloudinary URL, not registered in next/image remotePatterns
                    <img
                      src={field.value}
                      alt="Subcategory"
                      className="h-24 w-full rounded-lg border border-border-light object-cover"
                    />
                  )}
                  <FormControl>
                    <CloudinaryUploader onUploaded={(result) => field.onChange(result.url)} />
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
                  <Label htmlFor="subcategory-active" className="font-normal text-text-primary">
                    Active
                  </Label>
                  <Switch id="subcategory-active" checked={field.value} onCheckedChange={field.onChange} />
                </div>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : subCategory ? "Save Changes" : "Create Subcategory"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
