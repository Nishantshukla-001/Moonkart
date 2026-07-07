"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImageIcon, Info, Search, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ROUTES } from "@/constants/routes";
import { siteConfig } from "@/constants/config";
import { adminProductService } from "@/features/admin/services/adminProduct.service";
import { ImagesManager } from "@/features/admin/components/ImagesManager";
import { VariantsManager } from "@/features/admin/components/VariantsManager";
import { productSchema, type ProductInput } from "@/features/products/validation/product.schema";
import { generateSlug } from "@/utils/generateSlug";
import type { IAdminCategory } from "@/types/admin";
import type { IBrand, IProductWithRelations } from "@/types/product";

interface ProductFormProps {
  product?: IProductWithRelations | null;
  categories: IAdminCategory[];
  brands: IBrand[];
}

function toDefaults(product?: IProductWithRelations | null): ProductInput {
  if (!product) {
    return {
      categoryId: "",
      subCategoryId: "",
      brandId: "",
      name: "",
      slug: "",
      shortDescription: "",
      description: "",
      sku: "",
      price: 0,
      salePrice: undefined,
      stock: 0,
      weight: undefined,
      dimensions: "",
      thumbnail: "",
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: false,
      isTrending: false,
      isPublished: true,
      hasVariants: false,
      metaTitle: "",
      metaDescription: "",
    };
  }

  return {
    categoryId: product.categoryId,
    subCategoryId: product.subCategoryId ?? "",
    brandId: product.brandId ?? "",
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription ?? "",
    description: product.description ?? "",
    sku: product.sku ?? "",
    price: product.price,
    salePrice: product.salePrice ?? undefined,
    stock: product.stock,
    weight: product.weight ?? undefined,
    dimensions: product.dimensions ?? "",
    thumbnail: product.thumbnail,
    isFeatured: product.isFeatured,
    isBestSeller: product.isBestSeller,
    isNewArrival: product.isNewArrival,
    isTrending: product.isTrending,
    isPublished: product.isPublished,
    hasVariants: product.hasVariants,
    metaTitle: product.metaTitle ?? "",
    metaDescription: product.metaDescription ?? "",
  };
}

export function ProductForm({ product, categories, brands }: ProductFormProps) {
  const router = useRouter();
  const [productId, setProductId] = useState<string | null>(product?.id ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!!product);

  const form = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: toDefaults(product),
  });

  const selectedCategoryId = form.watch("categoryId");
  const thumbnail = form.watch("thumbnail");
  const watchedName = form.watch("name");
  const watchedSlug = form.watch("slug");
  const metaTitle = form.watch("metaTitle");
  const metaDescription = form.watch("metaDescription");

  const availableSubCategories = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId)?.subCategories ?? [],
    [categories, selectedCategoryId]
  );

  function handleNameChange(value: string) {
    form.setValue("name", value);
    if (!slugTouched) {
      form.setValue("slug", generateSlug(value), { shouldValidate: true });
    }
  }

  async function onSubmit(values: ProductInput) {
    setIsSubmitting(true);

    if (productId) {
      const result = await adminProductService.update(productId, values);
      setIsSubmitting(false);
      if (!result.success || !result.data) {
        toast.error(result.message || "Could not save changes.");
        return;
      }
      toast.success("Product updated.");
      router.refresh();
      return;
    }

    const result = await adminProductService.create(values);
    setIsSubmitting(false);
    if (!result.success || !result.data) {
      toast.error(result.message || "Could not create product.");
      return;
    }

    toast.success("Product created. You can now add variants and images.");
    setProductId(result.data.id);
    router.replace(ROUTES.adminProductEdit(result.data.id));
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <Tabs defaultValue="basic">
          <TabsList>
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="variants">Variants</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="mt-4">
            <Card className="flex flex-col gap-5 p-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue("subCategoryId", "");
                        }}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select category" />
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
                  name="subCategoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategory</FormLabel>
                      <Select
                        value={field.value || "none"}
                        onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
                        disabled={availableSubCategories.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="None" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {availableSubCategories.map((subCategory) => (
                            <SelectItem key={subCategory.id} value={subCategory.id}>
                              {subCategory.name}
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
                  name="brandId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <Select
                        value={field.value || "none"}
                        onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="None" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {brands.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="shortDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Description</FormLabel>
                    <FormControl>
                      <Textarea rows={2} placeholder="Shown on product cards and listings" {...field} />
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
                      <Textarea rows={6} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="thumbnail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thumbnail URL</FormLabel>
                    <div className="flex items-start gap-3">
                      <FormControl>
                        <Input placeholder="https://…" {...field} />
                      </FormControl>
                      {thumbnail && (
                        <div className="size-11 shrink-0 overflow-hidden rounded-lg border border-border-light bg-bg-section">
                          {/* eslint-disable-next-line @next/next/no-img-element -- admin-entered arbitrary URL */}
                          <img src={thumbnail} alt="" className="size-full object-cover" />
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
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
                          onChange={(event) =>
                            field.onChange(event.target.value ? Number(event.target.value) : undefined)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Optional"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(event) =>
                            field.onChange(event.target.value ? Number(event.target.value) : undefined)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dimensions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dimensions</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 30 x 20 x 10 cm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {(
                  [
                    ["isFeatured", "Featured"],
                    ["isBestSeller", "Best Seller"],
                    ["isNewArrival", "New Arrival"],
                    ["isTrending", "Trending"],
                    ["isPublished", "Published"],
                    ["hasVariants", "Has Variants"],
                  ] as const
                ).map(([name, label]) => (
                  <FormField
                    key={name}
                    control={form.control}
                    name={name}
                    render={({ field }) => (
                      <div className="flex items-center justify-between rounded-lg border border-border-light px-3.5 py-3">
                        <Label htmlFor={name} className="font-normal text-text-primary">
                          {label}
                        </Label>
                        <Switch id={name} checked={!!field.value} onCheckedChange={field.onChange} />
                      </div>
                    )}
                  />
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="variants" className="mt-4">
            <Card className="p-5">
              {productId ? (
                <VariantsManager productId={productId} initialVariants={product?.variants ?? []} key={productId} />
              ) : (
                <LockedTabNotice
                  icon={Info}
                  message="Save the product's basic info first — then you can add size/color variants here."
                />
              )}
            </Card>
          </TabsContent>

          <TabsContent value="images" className="mt-4">
            <Card className="p-5">
              {productId ? (
                <ImagesManager productId={productId} initialImages={product?.images ?? []} key={productId} />
              ) : (
                <LockedTabNotice
                  icon={ImageIcon}
                  message="Save the product's basic info first — then you can add gallery images here."
                />
              )}
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="mt-4">
            <Card className="flex flex-col gap-5 p-5">
              <FormField
                control={form.control}
                name="metaTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Title</FormLabel>
                    <FormControl>
                      <Input placeholder={watchedName || "Defaults to the product name"} {...field} />
                    </FormControl>
                    <p className="text-xs text-text-muted">{(metaTitle ?? "").length}/70</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metaDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Description</FormLabel>
                    <FormControl>
                      <Textarea rows={3} placeholder="Defaults to the short description" {...field} />
                    </FormControl>
                    <p className="text-xs text-text-muted">{(metaDescription ?? "").length}/160</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-1 rounded-lg border border-border-light bg-bg-section p-4">
                <span className="flex items-center gap-1.5 text-xs text-text-muted">
                  <Search className="size-3.5" /> Search preview
                </span>
                <span className="truncate text-sm text-info">
                  {siteConfig.url}/products/{watchedSlug || "product-slug"}
                </span>
                <span className="truncate text-base font-medium text-text-primary">
                  {metaTitle || watchedName || "Product name"}
                </span>
                <span className="line-clamp-2 text-sm text-text-secondary">
                  {metaDescription || "Shop this product on MoonKart."}
                </span>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 rounded-card border border-border-light bg-background p-4 shadow-soft">
          <Button type="button" variant="outline" onClick={() => router.push(ROUTES.adminProducts)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Sparkles className="size-4" />
            {isSubmitting ? "Saving…" : productId ? "Save Changes" : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function LockedTabNotice({ icon: Icon, message }: { icon: typeof Info; message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <div className="flex size-11 items-center justify-center rounded-full bg-blush-light">
        <Icon className="size-5 text-blush-hover" aria-hidden="true" />
      </div>
      <p className="max-w-xs text-sm text-text-muted">{message}</p>
    </div>
  );
}
