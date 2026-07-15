import type { Category, FeaturedCategory, FeaturedSubCategory, SubCategory } from "@prisma/client";

export interface IFeaturedCategoryWithCategory extends FeaturedCategory {
  category: Category;
}

export interface IFeaturedSubCategoryWithSubCategory extends FeaturedSubCategory {
  subCategory: SubCategory;
}
