"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ICategory, IBrand } from "@/types/product";

interface ProductFiltersProps {
  categories: ICategory[];
  brands: IBrand[];
  basePath: string;
  /** Hide the category filter when the page itself is already scoped to one category. */
  hideCategoryFilter?: boolean;
  /** Hide the brand filter when the page itself is already scoped to one brand. */
  hideBrandFilter?: boolean;
}

export function ProductFilters({
  categories,
  brands,
  basePath,
  hideCategoryFilter,
  hideBrandFilter,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category");
  const activeBrand = searchParams.get("brand");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`${basePath}?${params.toString()}`);
  }

  function applyPriceRange() {
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");
    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");
    params.delete("page");
    router.push(`${basePath}?${params.toString()}`);
  }

  function clearFilters() {
    setMinPrice("");
    setMaxPrice("");
    router.push(basePath);
  }

  const hasActiveFilters = Boolean(
    activeCategory || activeBrand || searchParams.get("minPrice") || searchParams.get("maxPrice")
  );

  return (
    <aside className="flex w-full flex-col gap-6 lg:w-64 lg:shrink-0">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-text-primary">Filters</h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-medium text-blush-hover transition-colors hover:text-text-primary"
          >
            Clear all
          </button>
        )}
      </div>

      {!hideCategoryFilter && categories.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="font-heading text-sm font-semibold text-text-primary">Category</h3>
          <div className="flex flex-col gap-2.5">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center gap-2.5 text-sm text-text-secondary">
                <Checkbox
                  checked={activeCategory === category.slug}
                  onCheckedChange={(checked) =>
                    updateParam("category", checked ? category.slug : null)
                  }
                />
                {category.name}
              </label>
            ))}
          </div>
        </div>
      )}

      {!hideBrandFilter && brands.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="font-heading text-sm font-semibold text-text-primary">Brand</h3>
          <div className="flex flex-col gap-2.5">
            {brands.map((brand) => (
              <label key={brand.id} className="flex items-center gap-2.5 text-sm text-text-secondary">
                <Checkbox
                  checked={activeBrand === brand.slug}
                  onCheckedChange={(checked) => updateParam("brand", checked ? brand.slug : null)}
                />
                {brand.name}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <h3 className="font-heading text-sm font-semibold text-text-primary">Price</h3>
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="min-price" className="text-xs text-text-muted">
              Min
            </Label>
            <Input
              id="min-price"
              type="number"
              min={0}
              placeholder="0"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              className="h-9"
            />
          </div>
          <span className="mt-4 text-text-muted">–</span>
          <div className="flex flex-col gap-1">
            <Label htmlFor="max-price" className="text-xs text-text-muted">
              Max
            </Label>
            <Input
              id="max-price"
              type="number"
              min={0}
              placeholder="10000"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              className="h-9"
            />
          </div>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={applyPriceRange}>
          Apply
        </Button>
      </div>
    </aside>
  );
}
