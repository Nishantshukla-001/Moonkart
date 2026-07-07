/** Set on the forwarded request only after middleware has itself verified the
 *  session with Supabase's Auth API — lets `getCurrentUser()` skip a second,
 *  redundant verification round trip in Route Handlers/Server Components. */
export const VERIFIED_SUPABASE_ID_HEADER = "x-verified-supabase-id";
