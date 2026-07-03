/**
 * JS mirror of design/Colors.md for non-Tailwind consumers (charts, canvas, email templates).
 * The CSS custom properties in app/globals.css are the source of truth for the app UI —
 * keep this file in sync with that file and with design/Colors.md.
 */
export const moonkartColors = {
  sage: "#C8D8B3",
  sageHover: "#B8C9A2",
  sageLight: "#F7FAF4",
  blush: "#F5D4DC",
  blushHover: "#EFC6D1",
  warmYellow: "#F9EDB7",

  background: "#FFFFFF",
  backgroundSecondary: "#FCFCF9",
  backgroundSection: "#FFFDF7",
  backgroundDashboard: "#F8F8F5",

  textPrimary: "#2F2F2F",
  textSecondary: "#5B5B5B",
  textMuted: "#888888",
  textPlaceholder: "#A0A0A0",
  textDisabled: "#C5C5C5",

  borderLight: "#ECECEC",
  borderMedium: "#DDDDDD",
  inputBorder: "#D9D9D9",
  divider: "#EFEFEF",

  success: "#7BBF7B",
  warning: "#F3C86A",
  danger: "#E67C73",
  info: "#7DAEDB",

  badgeNewArrival: "#C8D8B3",
  badgeSale: "#F5D4DC",
  badgeTrending: "#F9EDB7",
  badgeExclusive: "#D8C4A8",
  badgeLimitedEdition: "#BFA58A",
} as const;

export const chartColors = [
  moonkartColors.sage,
  moonkartColors.blush,
  moonkartColors.warmYellow,
  moonkartColors.success,
  moonkartColors.info,
] as const;
