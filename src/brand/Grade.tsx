import React from 'react';
import { AbsoluteFill } from 'remotion';
import { colors } from './tokens';

/**
 * Uniform colour grade for generated still frames.
 *
 * Stills come out of different image models with different white balance,
 * contrast, and noise floors. Grade pushes them all through the same
 * pipeline — luminance-mapped colour, grain, vignette — so a sequence of
 * separately-generated images cuts together as one film instead of reading
 * as a slideshow. It's meant to be subtle: its job is consistency across
 * many frames, not a visible look on any one of them.
 *
 * Built entirely from CSS filters and blend-mode layers, not SVG filters:
 * feTurbulence/feColorMatrix are notably slow across the hundreds of
 * frames a Remotion render walks through, where plain CSS compositing is
 * cheap because Chromium hands it to the GPU.
 */

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

const hexToRgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const toHex2 = (v: number) => v.toString(16).padStart(2, '0');
/** Linear per-channel mix between two hex colors, t in [0,1]. */
const mixHex = (from: string, to: string, t: number) => {
  const [fr, fg, fb] = hexToRgb(from);
  const [tr, tg, tb] = hexToRgb(to);
  const lerp = (a: number, b: number) => Math.round(a + (b - a) * clamp01(t));
  return `#${toHex2(lerp(fr, tr))}${toHex2(lerp(fg, tg))}${toHex2(lerp(fb, tb))}`;
};

/**
 * Seeded PRNG (mulberry32) — deterministic in `seed` alone, never in frame
 * or time. Math.random would let two parallel render workers producing
 * different frames of the same still disagree on the grain texture; this
 * can't, because it never reads anything but the seed.
 */
const mulberry32 = (seed: number) => {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const GRAIN_TILE = 200;
const GRAIN_SPECKS = 260;

/** A tileable speckle field rendered as plain SVG shapes (no <filter>). */
const buildGrainDataUri = (seed: number) => {
  const rand = mulberry32(seed);
  let shapes = '';
  for (let i = 0; i < GRAIN_SPECKS; i++) {
    const x = (rand() * GRAIN_TILE).toFixed(1);
    const y = (rand() * GRAIN_TILE).toFixed(1);
    const r = (0.4 + rand() * 1.1).toFixed(2);
    const o = (0.12 + rand() * 0.5).toFixed(2);
    const shade = rand() < 0.5 ? 'black' : 'white';
    shapes += `<circle cx="${x}" cy="${y}" r="${r}" fill="${shade}" fill-opacity="${o}"/>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${GRAIN_TILE}" height="${GRAIN_TILE}">${shapes}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

export interface GradeProps {
  children: React.ReactNode;
  /** Overall grade intensity — scales the luminance-mapped colour work. 0-1. */
  strength?: number;
  /** Film grain opacity. 0-1. */
  grain?: number;
  /** Vignette opacity. 0-1. */
  vignette?: number;
  /** Where the shadow/highlight thresholds sit, not how strongly they're
   *  applied: higher warmth lets more of the frame's bright end qualify as
   *  "warm highlight" (accentOrange) and less of its dark end qualify as
   *  "cool midtone" (accentBlue). 0.5 is even; even then only a small,
   *  genuinely bright minority of a typical frame should read as warm. */
  warmth?: number;
  /** Grain texture seed. Same seed -> same grain, on any worker. */
  seed?: number;
}

export const Grade: React.FC<GradeProps> = ({
  children,
  strength = 0.25,
  grain = 0.15,
  vignette = 0.3,
  warmth = 0.5,
  seed = 1,
}) => {
  const s = clamp01(strength);
  const g = clamp01(grain);
  const v = clamp01(vignette);
  const w = clamp01(warmth);

  const grainUri = React.useMemo(() => buildGrainDataUri(seed), [seed]);

  // `lighten`/`darken` (not `screen`/`multiply`) do the highlight/shadow
  // split. `screen` and `multiply` are affine in the backdrop at any
  // opacity — screen(black, orange) still equals orange*opacity, so it was
  // injecting the warm colour into the darkest pixels too, flattening a
  // cold TV spill toward sepia along with everything else. `lighten` only
  // ever raises a pixel toward `shadowColor` when the pixel is already
  // darker than it, and `darken` only ever pulls a pixel toward
  // `highlightColor` when it's already brighter — on the other side of
  // that threshold the layer has exactly zero effect, at any opacity. That
  // makes this luminance-gated rather than a flat wash.
  //
  // `warmth` moves the thresholds, not the opacity: raising it dims
  // `shadowColor` toward colors.bg (fewer pixels read as "cool", since
  // fewer clear the lighten floor) and brightens `highlightColor` toward
  // colors.white less (more pixels clear the darken ceiling) — so more of
  // the frame reads as warm highlight. At the default (0.5), the highlight
  // threshold sits high enough that only a small, genuinely bright minority
  // of a typical frame — a lamp, a screen — qualifies.
  const shadowColor = mixHex(colors.accentBlue, colors.bg, 0.25 + 0.5 * w);
  const highlightColor = mixHex(colors.accentOrange, colors.white, 0.75 - 0.5 * w);

  return (
    <AbsoluteFill>
      {/* Desaturate/contrast prep — the base the colour map paints onto. */}
      <AbsoluteFill style={{ filter: `grayscale(${0.8 * s}) contrast(${1 + 0.2 * s}) brightness(${1 - 0.05 * s})` }}>
        {children}
      </AbsoluteFill>

      {/* Shadows -> colors.bg. Multiply is a proportional darken/tint, safe
          here because it's the base of the stack, not layered on top of an
          already-tinted image. */}
      <AbsoluteFill style={{ backgroundColor: colors.bg, mixBlendMode: 'multiply', opacity: 0.5 * s }} />

      {/* Cool midtones -> accentBlue, only below the (warmth-set) floor. */}
      <AbsoluteFill style={{ backgroundColor: shadowColor, mixBlendMode: 'lighten', opacity: 0.55 * s }} />

      {/* Warm highlights -> accentOrange, only above the (warmth-set) ceiling. */}
      <AbsoluteFill style={{ backgroundColor: highlightColor, mixBlendMode: 'darken', opacity: 0.55 * s }} />

      {/* Film grain — deterministic per seed. */}
      <AbsoluteFill style={{
        backgroundImage: `url(${grainUri})`,
        backgroundRepeat: 'repeat',
        backgroundSize: `${GRAIN_TILE}px ${GRAIN_TILE}px`,
        mixBlendMode: 'overlay',
        opacity: g,
      }} />

      {/* Vignette, painted last. */}
      <AbsoluteFill style={{
        background: `radial-gradient(ellipse at center, transparent 55%, ${colors.bg} 145%)`,
        mixBlendMode: 'multiply',
        opacity: v,
      }} />
    </AbsoluteFill>
  );
};
