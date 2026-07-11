export interface RecentlyViewedItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  viewedAt: number;
}

const STORAGE_KEY = "moonkart_recently_viewed";
const MAX_ITEMS = 12;

export function readRecentlyViewed(): RecentlyViewedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RecentlyViewedItem[]) : [];
  } catch {
    return [];
  }
}

/** Records a product view — moves it to the front if already present, caps the list at MAX_ITEMS. */
export function trackRecentlyViewed(item: Omit<RecentlyViewedItem, "viewedAt">) {
  if (typeof window === "undefined") return;
  const current = readRecentlyViewed().filter((existing) => existing.productId !== item.productId);
  const next = [{ ...item, viewedAt: Date.now() }, ...current].slice(0, MAX_ITEMS);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function clearRecentlyViewed() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
