/**
 * Vector Verdicts — font loading.
 *
 * Kept separate from tokens.ts because loading has side effects (network
 * fetch + family registration); tokens are inert data.
 *
 * NOTE: fetches from Google's CDN at render time. To make renders fully
 * offline, replace the internals here with local .woff2 files in public/fonts/
 * via Remotion's staticFile() — no component changes required.
 */
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadSpaceMono } from '@remotion/google-fonts/SpaceMono';

const inter = loadInter('normal', { weights: ['400', '500', '600', '700'] });
const spaceMono = loadSpaceMono('normal', { weights: ['400', '700'] });

/**
 * Await before rendering text. Remotion rasterizes frames in parallel, so
 * without this a worker can draw a frame in a fallback face — producing a
 * single mistyped frame mid-render.
 */
export const waitForFonts = async (): Promise<void> => {
  await Promise.all([inter.waitUntilDone(), spaceMono.waitUntilDone()]);
};

export const interFamily = inter.fontFamily;
export const monoFamily = spaceMono.fontFamily;
