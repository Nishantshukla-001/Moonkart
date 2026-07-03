/**
 * Maps raw Supabase Auth error messages to the user-friendly messages
 * required by docs/Authentication.md's Error Handling section. Never
 * surface internal Supabase/Postgres error text to the client.
 */
export function mapSupabaseAuthError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("already registered") || lower.includes("already exists")) {
    return "An account with this email already exists.";
  }
  if (lower.includes("invalid login credentials")) {
    return "Invalid email or password.";
  }
  if (lower.includes("email not confirmed")) {
    return "Please verify your email before logging in.";
  }
  if (lower.includes("invalid email")) {
    return "Enter a valid email address.";
  }
  if (lower.includes("password")) {
    return "Password does not meet the required policy.";
  }
  if (lower.includes("rate limit") || lower.includes("too many")) {
    return "Too many attempts. Please try again shortly.";
  }
  if (lower.includes("user not found")) {
    return "No account found with this email.";
  }
  if (lower.includes("session") || lower.includes("token")) {
    return "Your session has expired. Please try again.";
  }

  return "Something went wrong. Please try again.";
}
