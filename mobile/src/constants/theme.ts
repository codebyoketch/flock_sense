/**
 * Central theme tokens.
 *
 * Every screen should pull its colors and border radii from here rather than
 * hardcoding hex values or numbers inline. To re-theme the app (e.g. swap
 * the brand color, adjust corner rounding), change values here — no need to
 * touch individual screens.
 */

export const COLORS = {
  // Brand green — primary actions, active states, links, positive values.
  primary: "#2e7d32",
  primaryDark: "#1b5e20", // grade A, onboarding title
  primaryDarkText: "#33691e", // body text on primaryLight backgrounds
  primaryLight: "#e8f5e9", // light green surfaces (onboarding card, reciprocity bar)
  secondary: "#558b2f", // grade B

  // Amber/orange — warnings, "action needed" surfaces, mid-range grades.
  warning: "#f9a825", // grade C
  warningDark: "#ef6c00", // grade D
  warningDarker: "#e65100", // pending-verification banner text, badge-not-ready title
  warningLight: "#fff3e0", // pending-verification banner bg, badge-not-ready bg
  warningText: "#8a5a1f", // body text on warningLight backgrounds

  // Red — errors, flags, destructive actions.
  danger: "#c62828",
  dangerLight: "#ffebee",

  disabled: "#bdbdbd", // offline dot, inactive states

  white: "#ffffff",
  surface: "#f5f5f5", // card / row backgrounds
  overlay: "rgba(0,0,0,0.4)", // modal backdrops

  border: "#cccccc",
  borderLight: "#eeeeee",

  // Text — darkest to lightest.
  textDarkest: "#222222",
  textDark: "#333333",
  textSecondary: "#555555",
  textSecondaryAlt: "#666666",
  textMuted: "#777777",
  textFootnote: "#888888",
  textFaint: "#999999",
} as const;

export const GRADE_COLORS = {
  A: COLORS.primaryDark,
  B: COLORS.secondary,
  C: COLORS.warning,
  D: COLORS.warningDark,
  E: COLORS.danger,
} as const;

export const RADII = {
  xs: 4,
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16, // modal top corners
  pill: 20, // chip / filter pills
} as const;
