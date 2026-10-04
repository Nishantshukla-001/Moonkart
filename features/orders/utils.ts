/**
 * Client-confirmed fixed delivery pricing — no admin configuration, no free-
 * shipping threshold, no other zones. ₹70 applies only to Delhi itself, not
 * the wider NCR; every other Indian location (including NCR satellite
 * cities like Gurugram/Noida/Ghaziabad/Faridabad) falls back to the
 * standard rate — see DELHI_LOCALITIES and isDelhiAddress below.
 */
export const SHIPPING_CHARGE_DELHI = 70;
export const SHIPPING_CHARGE_OTHER = 100;

/**
 * Explicit, normalized allowlist of Delhi directional zones and commonly
 * used Delhi locality/area names — not a fuzzy/substring match. This is a
 * backup safety net for addresses whose `state` field wasn't filled in as
 * "Delhi"; the primary signal is the state check in `isDelhiAddress` below,
 * since it correctly covers the entire Delhi region — including localities
 * not listed here — while naturally excluding NCR cities, which sit in
 * Haryana/Uttar Pradesh, not Delhi.
 */
const DELHI_LOCALITIES = new Set([
  "delhi",
  "new delhi",
  "old delhi",
  "north delhi",
  "south delhi",
  "east delhi",
  "west delhi",
  "central delhi",
  "north east delhi",
  "north west delhi",
  "south east delhi",
  "south west delhi",
  "shahdara",
  "rohini",
  "dwarka",
  "janakpuri",
  "lajpat nagar",
  "saket",
  "karol bagh",
  "pitampura",
  "rajouri garden",
  "mayapuri",
  "paschim vihar",
  "tagore garden",
]);

/**
 * Delhi's state field is reliably just "Delhi" (officially "NCT of Delhi")
 * on Indian address forms, regardless of which locality the city field
 * names — unlike city, this one field covers the whole Delhi region without
 * enumerating every neighborhood. Deliberately excludes "delhi ncr": a
 * state field filled in ambiguously as "Delhi NCR" does not by itself mean
 * the address is in Delhi (NCR also spans Haryana/Uttar Pradesh), so it
 * must not auto-qualify.
 */
const DELHI_STATE_NAMES = new Set(["delhi", "nct of delhi"]);

/** Lowercase + trim + collapse internal whitespace, so casing/spacing differences compare equal. */
function normalizeCity(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * An address counts as Delhi if either its state is Delhi (the
 * authoritative, region-wide signal — covers every Delhi locality without
 * enumerating them) or its city exactly matches a known Delhi zone/locality
 * name. Satellite NCR cities (Gurugram, Noida, Ghaziabad, Faridabad, ...)
 * live in Haryana/Uttar Pradesh, so neither check ever fires for them. No
 * substring/fuzzy matching anywhere — both are exact Set lookups.
 */
export function isDelhiAddress(city: string, state: string): boolean {
  if (DELHI_STATE_NAMES.has(normalizeCity(state))) return true;
  return DELHI_LOCALITIES.has(normalizeCity(city));
}

/** Pure, isomorphic (no `server-only`) — used both server-side (authoritative) and client-side (display only, see CheckoutClient). */
export function calculateShippingCharge(city: string, state: string): number {
  return isDelhiAddress(city, state) ? SHIPPING_CHARGE_DELHI : SHIPPING_CHARGE_OTHER;
}
