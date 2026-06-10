export const Colors = {
  primary: "#0D1F29",
  primaryDark: "#081620",
  primaryLight: "#13303F",

  accent: "#22C55E",
  accentPressed: "#16A34A",

  textPrimary: "#FFFFFF",
  textSecondary: "#C7CDD1",
  textMuted: "#7A8590",

  dotActive: "#FFFFFF",
  dotInactive: "#3A4750",

  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
} as const;

export type ColorKey = keyof typeof Colors;
