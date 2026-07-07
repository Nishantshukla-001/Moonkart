import {
  Layers,
  LayoutDashboard,
  LayoutGrid,
  Package,
  Settings,
  ShoppingCart,
  Tags,
  Users,
} from "lucide-react";

import { ROUTES } from "@/constants/routes";

export interface AdminNavLink {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}

export const ADMIN_NAV_LINKS: AdminNavLink[] = [
  { label: "Dashboard", href: ROUTES.adminDashboard, icon: LayoutDashboard },
  { label: "Products", href: ROUTES.adminProducts, icon: Package },
  { label: "Categories", href: ROUTES.adminCategories, icon: LayoutGrid },
  { label: "Subcategories", href: ROUTES.adminSubCategories, icon: Layers },
  { label: "Brands", href: ROUTES.adminBrands, icon: Tags },
  { label: "Orders", href: ROUTES.adminOrders, icon: ShoppingCart },
  { label: "Customers", href: ROUTES.adminCustomers, icon: Users },
  { label: "Settings", href: ROUTES.adminSettings, icon: Settings },
];
