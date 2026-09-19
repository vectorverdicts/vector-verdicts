import React, { useCallback, useState } from 'react';
import {
  AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig,
  interpolate, spring, delayRender, continueRender,
} from 'remotion';
import { Frame } from '../brand/Frame';
import { colors, type as t, space, glow } from '../brand/tokens';
import { monoFamily } from '../brand/fonts';
import type { Scene } from '../VideoRoot';

/**
 * A supplied image — screenshot, chart, product shot.
 *
 * Slow Ken Burns push by default: a static frame held for several seconds
 * reads as dead air in a Short, and subtle motion fixes that without
 * competing for attention.
 *
 * The caption renders as an animated spec card: a white label ("Variable
 * aperture") over a mono accent-blue value ("ƒ/1.48–ƒ/4.0"), split on the
 * middle-dot delimiter. The card slides up + fades on a spring; the value
 * pops after the label lands with a brief cyan pulse.
 */

/** Split "Label · value" on the middle-dot/ bullet delimiter. */
const captionParts = (caption?: string): string[] =>
  (caption ?? '').split(/[·•]/).map((p) => p.trim()).filter(Boolean);

/** Own component so hooks are top-level, not in a render branch. */
const SpecBar: React.FC<{ caption?: string }> = ({ caption }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const parts = captionParts(caption);
  const label = parts[0] ?? '';
  const value = parts.slice(1).join(' · ');

  // Card slides up + fades in.
  const s = spring({ frame: frame - 8, fps, config: { damping: 13, mass: 0.7 } });
  const rise = interpolate(s, [0, 1], [70, 0], { extrapolateRight: 'clamp' });
  const cardOpacity = interpolate(s, [0, 0.42], [0, 1], { extrapolateRight: 'clamp' });

  // Value pops after the label lands, with a short cyan glow.
  const v = spring({ frame: frame - 18, fps, config: { damping: 10, mass: 0.7 } });
  const vScale = interpolate(v, [0, 1], [1.25, 1], { extrapolateRight: 'clamp' });
  const vOpacity = interpolate(v, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <div style={{
      display: 'flex', alignItems: 'stretch', borderRadius: 14, overflow: 'hidden',
      background: 'rgba(15,22,34,0.86)',
      border: `1px solid ${colors.border}`,
      boxShadow: glow(colors.accentBlue, 0.22),
      transform: `translateY(${rise}px)`,
      opacity: cardOpacity,
    }}>
      {/* Brand split: blue (left) -> orange (right), mirrors the logo mark. */}
      <div style={{ width: 6,
        background: `linear-gradient(180deg, ${colors.accentBlue}, ${colors.accentOrange})` }} />
      <div style={{
        flex: 1,
        padding: `${space.sm}px ${space.lg}px ${space.sm}px ${space.md}px`,
        display: 'flex', flexDirection: 'column', gap: space.xs,
      }}>
        <div style={{
          fontSize: t.h3, fontWeight: t.weight.semibold, color: colors.white,
          lineHeight: 1.1,
        }}>
          {label}
        </div>
        {value ? (
          <div style={{
            fontFamily: monoFamily, fontSize: t.h3, fontWeight: t.weight.bold,
            color: colors.accentBlue, whiteSpace: 'nowrap',
            textShadow: glow(colors.accentBlue, 0.5),
            transform: `scale(${vScale})`,
            opacity: vOpacity,
          }}>
            {value}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export const ImageScene: React.FC<{ s: Extract<Scene, { kind: 'image' }> }> = ({ s }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [handle] = useState(() => delayRender('loading scene image'));
  const done = useCallback(() => continueRender(handle), [handle]);

  const dur = Math.max(1, Math.round(s.seconds * fps));
  const scale = interpolate(frame, [0, dur], [1, 1.08], { extrapolateRight: 'clamp' });
  const opacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <Frame padded={false}>
      <AbsoluteFill style={{ overflow: 'hidden', opacity }}>
        <Img
          src={staticFile(s.src)}
          onLoad={done}
          onError={done}
          style={{
            width: '100%', height: '100%',
            objectFit: s.fit ?? 'contain',
            transform: `scale(${scale})`,
          }}
        />
      </AbsoluteFill>
      {s.caption ? (
        <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center',
          padding: space.xl, pointerEvents: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <SpecBar caption={s.caption} />
          </div>
        </AbsoluteFill>
      ) : null}
    </Frame>
  );
};