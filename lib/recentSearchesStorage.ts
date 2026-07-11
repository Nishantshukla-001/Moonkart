const STORAGE_KEY = "moonkart_recent_searches";
const MAX_ITEMS = 6;

export function readRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(term: string) {
  if (typeof window === "undefined") return;
  const trimmed = term.trim();
  if (!trimmed) return;

  try {
    const existing = readRecentSearches().filter(
      (item) => item.toLowerCase() !== trimmed.toLowerCase()
    );
    const next = [trimmed, ...existing].slice(0, MAX_ITEMS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable (private browsing / quota) — recent searches are a nice-to-have, never worth failing the search itself over.
  }
}

export function removeRecentSearch(term: string) {
  if (typeof window === "undefined") return;
  try {
    const next = readRecentSearches().filter((item) => item !== term);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // See addRecentSearch — best-effort only.
  }
}

export function clearRecentSearches() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // See addRecentSearch — best-effort only.
  }
}
