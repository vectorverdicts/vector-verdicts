import React from 'react';
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';
import { colors, type as t, space, glow } from '../brand/tokens';
import type { WordTiming } from './timing';

const GROUP = 7;

/**
 * Burned-in captions with word-by-word highlight.
 *
 * Renders a rolling window of words around the current one — showing the
 * whole transcript at once is unreadable at phone scale.
 */
export const Captions: React.FC<{ words: WordTiming[] }> = ({ words }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const now = frame / fps;

  if (words.length === 0) return null;

  // Active word, or the most recent one during a pause between words.
  let active = words.findIndex((w) => now >= w.start && now <= w.end);
  if (active === -1) {
    const passed = words.filter((w) => w.end < now).length;
    active = Math.max(0, Math.min(passed, words.length - 1));
  }

  const groupStart = Math.floor(active / GROUP) * GROUP;
  const group = words.slice(groupStart, groupStart + GROUP);

  // Shorts have platform UI over the lower screen (like/comment rail,
  // title overlay). Sit higher in vertical to clear it.
  const isVertical = height > width;
  const top = isVertical ? '72%' : '82%';

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute', top, left: 0, right: 0,
        paddingLeft: space.xl, paddingRight: space.xl,
        display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
        gap: `${space.xs}px ${space.sm}px`,
      }}>
        {group.map((w, i) => {
          const isActive = groupStart + i === active;
          return (
            <span key={groupStart + i} style={{
              fontSize: t.caption,
              fontWeight: t.weight.bold,
              letterSpacing: t.tracking.display,
              color: isActive ? colors.accentBlue : colors.white,
              textShadow: isActive
                ? glow(colors.accentBlue, 0.5)
                : '0 2px 12px rgba(0,0,0,0.85)',
              transition: 'none',
            }}>
              {w.word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
