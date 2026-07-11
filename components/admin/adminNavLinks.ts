import {
  BarChart3,
  Boxes,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  Package,
  Settings,
  ShoppingCart,
  Star,
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
  { label: "Analytics", href: ROUTES.adminAnalytics, icon: BarChart3 },
  { label: "Products", href: ROUTES.adminProducts, icon: Package },
  { label: "Inventory", href: ROUTES.adminInventory, icon: Boxes },
  { label: "Categories", href: ROUTES.adminCategories, icon: LayoutGrid },
  { label: "Subcategories", href: ROUTES.adminSubCategories, icon: Layers },
  { label: "Brands", href: ROUTES.adminBrands, icon: Tags },
  { label: "Orders", href: ROUTES.adminOrders, icon: ShoppingCart },
  { label: "Reviews", href: ROUTES.adminReviews, icon: Star },
  { label: "Customers", href: ROUTES.adminCustomers, icon: Users },
  { label: "Settings", href: ROUTES.adminSettings, icon: Settings },
];
