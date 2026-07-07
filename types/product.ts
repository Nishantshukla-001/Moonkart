import type { Brand, Category, Product, ProductImage, ProductVariant, SubCategory } from "@prisma/client";

export type ICategory = Category;
export type ISubCategory = SubCategory;
export type IBrand = Brand;
export type IProductImage = ProductImage;
export type IProductVariant = ProductVariant;
export type IProduct = Product;

export interface IProductWithRelations extends IProduct {
  images: IProductImage[];
  variants: IProductVariant[];
  category: ICategory;
  subCategory: ISubCategory | null;
  brand: IBrand | null;
}

export interface IPaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
