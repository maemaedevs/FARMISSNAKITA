/**
 * Brand palette (mirrors farmis-mobile so web + mobile stay in sync).
 * Tailwind tokens are defined in `src/index.css` under `@theme`.
 */
export const Colors = {
  primary: '#0D1F29',
  primaryDark: '#081620',
  primaryLight: '#13303F',

  accent: '#22C55E',
  accentPressed: '#16A34A',

  textPrimary: '#FFFFFF',
  textSecondary: '#C7CDD1',
  textMuted: '#7A8590',

  surface: '#FFFFFF',
  surfaceMuted: '#F7F8FA',
  border: '#E5E7EB',
} as const;

export type ColorKey = keyof typeof Colors;
