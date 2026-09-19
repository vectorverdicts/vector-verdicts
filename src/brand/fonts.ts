import { staticFile, continueRender, delayRender } from 'remotion';

/**
 * Local font loading. No network at render time.
 *
 * Previously @remotion/google-fonts, which made 28 CDN requests PER WORKER on
 * every render — Inter at 4 weights across 5 unicode subsets. These files are
 * the latin subsets only, fetched once and committed.
 *
 * Inter is a VARIABLE font: one file covers 100-900, hence the weight RANGE
 * in its @font-face. A single value there would render every weight the same.
 */

export const interFamily = 'Inter';
export const monoFamily = 'Space Mono';

const CSS = `
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 100 900;
  font-display: block;
  src: url('${staticFile('fonts/inter-var-latin.woff2')}') format('woff2');
}
@font-face {
  font-family: 'Space Mono';
  font-style: normal;
  font-weight: 400;
  font-display: block;
  src: url('${staticFile('fonts/spacemono-400-latin.woff2')}') format('woff2');
}
@font-face {
  font-family: 'Space Mono';
  font-style: normal;
  font-weight: 700;
  font-display: block;
  src: url('${staticFile('fonts/spacemono-700-latin.woff2')}') format('woff2');
}
`;

let injected = false;
const inject = () => {
  if (injected || typeof document === 'undefined') return;
  const el = document.createElement('style');
  el.textContent = CSS;
  document.head.appendChild(el);
  injected = true;
};

/**
 * Await before rendering text. font-display: block means no fallback frame,
 * but a worker can still rasterise before decode completes — so we hold the
 * frame until every face is ready.
 */
export const waitForFonts = async (): Promise<void> => {
  inject();
  if (typeof document === 'undefined') return;
  const handle = delayRender('loading local fonts');
  try {
    await Promise.all([
      document.fonts.load('400 16px "Inter"'),
      document.fonts.load('700 16px "Inter"'),
      document.fonts.load('400 16px "Space Mono"'),
      document.fonts.load('700 16px "Space Mono"'),
    ]);
    await document.fonts.ready;
  } finally {
    continueRender(handle);
  }
};

inject();
