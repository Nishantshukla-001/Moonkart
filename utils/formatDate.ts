export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const value = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  }).format(value);
}
