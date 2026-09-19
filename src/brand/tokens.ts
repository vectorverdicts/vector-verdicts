/**
 * Vector Verdicts — brand design tokens.
 * Single source of truth. Components import from here; never hardcode a hex.
 *
 * PROVENANCE:
 *  - colors.accent*, colors.white, fonts.*  -> from the official brand kit sheet.
 *  - colors.bg                              -> MEASURED from VectorVerdict_Logo_800x800.png.
 *       The kit sheet prints "#300104" for Base Dark, but that is a near-black
 *       maroon (48,1,4) while the actual logo background is a near-black blue
 *       (6,9,16). The sheet's rendered swatch agrees with the logo, so the
 *       printed hex is treated as a transcription error. Using the measured
 *       value keeps logo PNGs seamless against the video canvas.
 *  - colors.surface/border/textMuted        -> DERIVED (kit defines no UI ramp).
 *  - type.*, space.*                        -> PROPOSED, not from the kit.
 */

export const colors = {
  /** Primary accent. Left branch of the V, glowing nodes, key highlights. */
  accentBlue: '#10C0FE',
  /** Secondary accent. Right branch facets, high-priority emphasis. */
  accentOrange: '#FF5823',
  /** Headings, logotype, core node highlights. */
  white: '#FFFFFF',

  /** Canvas. Measured from the logo background. */
  bg: '#060910',
  /** Elevated surfaces: cards, quote panels. Same blue-black family, lifted. */
  surface: '#0F1622',
  /** Hairline dividers and card edges. Matches the logo's glow-lift tone. */
  border: '#1B242C',
  /** Secondary body copy, labels, attribution lines. */
  textMuted: '#8A94A6',
} as const;

export const fonts = {
  /** Inter — UI, headings, body copy, wordmark treatment. */
  display: 'Inter',
  body: 'Inter',
  /** Space Mono — metrics, model names, version strings, code, data tables. */
  mono: 'Space Mono',
} as const;

/**
 * Output formats. Both share a 1080px SHORT edge, so one type scale
 * serves both with no per-format adjustment.
 */
export const formats = {
  short: { id: 'ShortVertical', width: 1080, height: 1920, fps: 30 },
  long: { id: 'LongHorizontal', width: 1920, height: 1080, fps: 30 },
} as const;

export type FormatKey = keyof typeof formats;

/** Type scale in px. Sized for legibility at phone scale, where Shorts live. */
export const type = {
  hero: 104,
  h1: 78,
  h2: 58,
  h3: 44,
  body: 36,
  caption: 64,
  label: 28,
  weight: { regular: 400, medium: 500, semibold: 600, bold: 700 },
  /** Tight tracking on large display text; slightly open on small caps labels. */
  tracking: { display: '-0.02em', body: '0em', label: '0.12em' },
  lineHeight: { display: 1.05, body: 1.35 },
} as const;

/** 8px base spacing scale. */
export const space = {
  xs: 8, sm: 16, md: 24, lg: 40, xl: 64, xxl: 96,
} as const;

/**
 * Brand kit clear-space rule: minimum 10% of total asset width around the mark.
 * Applied as the safe-area inset for all on-screen content.
 */
export const CLEAR_SPACE_RATIO = 0.1;

/** Neon bloom. The kit permits soft glow only — never a hard drop shadow. */
export const glow = (color: string, strength = 1) =>
  [
    '0 0 ' + 8 * strength + 'px ' + color,
    '0 0 ' + 24 * strength + 'px ' + color,
    '0 0 ' + 48 * strength + 'px ' + color,
  ].join(', ');
