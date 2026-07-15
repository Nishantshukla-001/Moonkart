"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ProductFilters } from "@/features/products/components/ProductFilters";
import type { IBrand, ICategory } from "@/types/product";

interface ProductFiltersPanelProps {
  categories: ICategory[];
  brands: IBrand[];
  basePath: string;
  hideCategoryFilter?: boolean;
  hideBrandFilter?: boolean;
}

/**
 * Trigger button + slide-over Sheet replacing the old permanently-visible
 * filter sidebar. Owns only the open/close state and panel chrome — every
 * filter field and all filtering logic still lives in ProductFilters,
 * untouched.
 */
export function ProductFiltersPanel({
  categories,
  brands,
  basePath,
  hideCategoryFilter,
  hideBrandFilter,
}: ProductFiltersPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button type="button" variant="outline" size="sm" />}>
        <SlidersHorizontal />
        Filters
      </SheetTrigger>
      <SheetContent side="left" className="w-4/5 sm:max-w-xs">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 pb-4">
          <ProductFilters
            categories={categories}
            brands={brands}
            basePath={basePath}
            hideCategoryFilter={hideCategoryFilter}
            hideBrandFilter={hideBrandFilter}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
