/**
 * Client-confirmed fixed delivery pricing — no admin configuration, no free-
 * shipping threshold, no other zones. Delhi/NCR per the client's explicit
 * list only; every other Indian city falls back to the standard rate.
 */
export const SHIPPING_CHARGE_DELHI_NCR = 80;
export const SHIPPING_CHARGE_OTHER = 130;

/**
 * Exact, explicit allowlist — not a fuzzy/substring match. Values are
 * pre-normalized (lowercase) to match `normalizeCity`'s output.
 */
const DELHI_NCR_CITIES = new Set([
  "delhi",
  "new delhi",
  "gurugram",
  "gurgaon",
  "noida",
  "greater noida",
  "ghaziabad",
  "faridabad",
]);

/** Lowercase + trim + collapse internal whitespace, so "Delhi", " delhi ", "DELHI" all compare equal. */
function normalizeCity(city: string): string {
  return city.trim().toLowerCase().replace(/\s+/g, " ");
}

export function isDelhiNcrCity(city: string): boolean {
  return DELHI_NCR_CITIES.has(normalizeCity(city));
}

/** Pure, isomorphic (no `server-only`) — used both server-side (authoritative) and client-side (display only, see CheckoutClient). */
export function calculateShippingCharge(city: string): number {
  return isDelhiNcrCity(city) ? SHIPPING_CHARGE_DELHI_NCR : SHIPPING_CHARGE_OTHER;
}
