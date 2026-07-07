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
import { adminCategoryService } from "@/features/admin/services/adminCategory.service";
import { categorySchema, type CategoryInput } from "@/features/categories/validation/category.schema";
import { generateSlug } from "@/utils/generateSlug";
import type { IAdminCategory } from "@/types/admin";

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: IAdminCategory | null;
  onSaved: (category: IAdminCategory) => void;
}

const emptyDefaults: CategoryInput = { name: "", slug: "", image: "", description: "", isActive: true };

export function CategoryFormDialog({ open, onOpenChange, category, onSaved }: CategoryFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: emptyDefaults,
  });

  useEffect(() => {
    if (!open) return;
    setSlugTouched(!!category);
    form.reset(
      category
        ? {
            name: category.name,
            slug: category.slug,
            image: category.image ?? "",
            description: category.description ?? "",
            isActive: category.isActive,
          }
        : emptyDefaults
    );
  }, [open, category, form]);

  function handleNameChange(value: string) {
    form.setValue("name", value);
    if (!slugTouched) {
      form.setValue("slug", generateSlug(value), { shouldValidate: true });
    }
  }

  async function onSubmit(values: CategoryInput) {
    setIsSubmitting(true);
    const result = category
      ? await adminCategoryService.update(category.id, values)
      : await adminCategoryService.create(values);
    setIsSubmitting(false);

    if (!result.success || !result.data) {
      toast.error(result.message || "Something went wrong.");
      return;
    }

    toast.success(category ? "Category updated." : "Category created.");
    onSaved(result.data);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{category ? "Edit Category" : "Add Category"}</DialogTitle>
          <DialogDescription>
            {category ? "Update this category's details." : "Create a new product category."}
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
              name="image"
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
                  <Label htmlFor="category-active" className="font-normal text-text-primary">
                    Active
                  </Label>
                  <Switch id="category-active" checked={field.value} onCheckedChange={field.onChange} />
                </div>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : category ? "Save Changes" : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
