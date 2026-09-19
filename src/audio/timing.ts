/**
 * Derive scene boundaries from narration word timings.
 *
 * Whisper transcribes what it HEARD, which drifts from the authored script
 * on numbers, model names and acronyms ("3.8" -> "three point eight").
 * So matching normalises both sides and anchors on a sliding window of
 * words that DO match, rather than demanding exact equality.
 */

export type WordTiming = {
  word: string;
  /** Seconds from start of audio. */
  start: number;
  end: number;
};

export type SceneWindow = { startSec: number; endSec: number };

/** Lowercase, strip punctuation, collapse whitespace. */
export const normalise = (s: string): string[] =>
  s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean);

/** Fraction of `needle` words present in `hay`, order-independent. */
const overlap = (needle: string[], hay: string[]): number => {
  if (needle.length === 0) return 0;
  const pool = new Map<string, number>();
  for (const w of hay) pool.set(w, (pool.get(w) ?? 0) + 1);
  let hits = 0;
  for (const w of needle) {
    const n = pool.get(w) ?? 0;
    if (n > 0) { hits++; pool.set(w, n - 1); }
  }
  return hits / needle.length;
};

/**
 * Best-matching span of `words` for `phrase`, searched from `fromIndex`.
 * Returns the word index range, or null if nothing scores above `minScore`.
 */
export const locate = (
  phrase: string,
  words: WordTiming[],
  fromIndex = 0,
  minScore = 0.5,
): { start: number; end: number } | null => {
  const target = normalise(phrase);
  if (target.length === 0) return null;

  const hay = words.map((w) => normalise(w.word).join(' '));
  const span = target.length;
  let best: { start: number; end: number; score: number } | null = null;

  // Allow the window to flex, since whisper may split or merge tokens.
  for (let len = Math.max(1, Math.floor(span * 0.6)); len <= Math.ceil(span * 1.6); len++) {
    for (let i = fromIndex; i + len <= words.length; i++) {
      const score = overlap(target, hay.slice(i, i + len));
      if (!best || score > best.score) best = { start: i, end: i + len - 1, score };
      if (score === 1) break;
    }
  }

  return best && best.score >= minScore ? { start: best.start, end: best.end } : null;
};

/**
 * Map each scene's narration to a time window.
 *
 * Searches strictly forward: scene N+1 starts after scene N ends, so a
 * repeated phrase cannot pull a later scene backwards. Scenes that fail
 * to match fall back to their neighbours' boundaries rather than throwing —
 * a mistimed scene is recoverable, a failed render is not.
 */
export const deriveWindows = (
  narrations: string[],
  words: WordTiming[],
): SceneWindow[] => {
  if (words.length === 0) return narrations.map(() => ({ startSec: 0, endSec: 0 }));

  const audioEnd = words[words.length - 1].end;
  const out: SceneWindow[] = [];
  let cursor = 0;
  let lastEnd = 0;

  for (const text of narrations) {
    const hit = locate(text, words, cursor);
    if (hit) {
      out.push({ startSec: words[hit.start].start, endSec: words[hit.end].end });
      cursor = hit.end + 1;
      lastEnd = words[hit.end].end;
    } else {
      // Unmatched: hold position; reconciled below.
      out.push({ startSec: lastEnd, endSec: lastEnd });
    }
  }

  // Close gaps so scenes butt up against each other with no dead frames,
  // and let the final scene run to the end of the audio.
  for (let i = 0; i < out.length; i++) {
    if (i > 0) out[i].startSec = out[i - 1].endSec;
    if (i === out.length - 1) out[i].endSec = Math.max(out[i].endSec, audioEnd);
    else if (out[i].endSec <= out[i].startSec) out[i].endSec = out[i].startSec + 0.5;
  }

  return out;
};
