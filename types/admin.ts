import type { IBrand, ICategory, IPaginatedResult, IProduct, ISubCategory } from "@/types/product";

export interface IAdminCategory extends ICategory {
  subCategories: ISubCategory[];
  _count: { products: number; subCategories: number };
}

export interface IAdminSubCategory extends ISubCategory {
  category: ICategory;
  _count: { products: number };
}

export interface IAdminBrand extends IBrand {
  _count: { products: number };
}

export interface IAdminProductListItem extends IProduct {
  category: ICategory;
  brand: IBrand | null;
  _count: { images: number; variants: number };
}

export type IAdminProductListResult = IPaginatedResult<IAdminProductListItem>;

export interface IAdminDashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalBrands: number;
  lowStockCount: number;
  outOfStockCount: number;
  recentProducts: IAdminProductListItem[];
  lowStockProducts: IAdminProductListItem[];
}
