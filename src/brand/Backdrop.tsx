import React, { useCallback, useState } from 'react';
import { AbsoluteFill, Img, staticFile, delayRender, continueRender,
  useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { colors } from './tokens';

/**
 * Constellation backdrop. Sits BEHIND scene content (painted first).
 *
 * The source artwork is lighter than the canvas (#060910), so it is dimmed
 * and scrimmed rather than used at full strength — bright nodes behind white
 * headlines hurt legibility at phone scale.
 */
export const Backdrop: React.FC<{ opacity?: number }> = ({ opacity = 0.2 }) => {
  const [handle] = useState(() => delayRender('loading backdrop'));
  const done = useCallback(() => continueRender(handle), [handle]);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slow drift so no frame is ever perfectly still — dead-still frames are
  // where attention drops on a Short. A full cycle takes ~20s, slow enough to
  // read as depth rather than as motion competing with the text.
  const CYCLE = 20 * fps;
  const driftX = interpolate(frame % CYCLE, [0, CYCLE], [-2.5, 2.5]);
  const driftY = interpolate(frame % CYCLE, [0, CYCLE], [1.5, -1.5]);
  // Oversized so the drift never exposes an edge.
  const zoom = 1.12 + 0.03 * Math.sin((frame / fps) * 0.22);

  // Two soft blooms on sine paths with different periods, so the pair never
  // settles into a visible loop. Sits BENEATH the constellation for depth.
  const t = frame / fps;
  const blueX = 30 + 18 * Math.sin(t * 0.13);
  const blueY = 28 + 14 * Math.cos(t * 0.09);
  const orangeX = 72 + 16 * Math.sin(t * 0.11 + 2.1);
  const orangeY = 68 + 12 * Math.cos(t * 0.15 + 1.3);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      <AbsoluteFill style={{
        background:
          `radial-gradient(60% 45% at ${blueX}% ${blueY}%, rgba(16,192,254,0.30) 0%, rgba(16,192,254,0) 68%),` +
          `radial-gradient(55% 42% at ${orangeX}% ${orangeY}%, rgba(255,88,35,0.22) 0%, rgba(255,88,35,0) 65%)`,
      }} />
      <Img
        src={staticFile('bg-constellation.jpg')}
        onLoad={done}
        onError={done}
        style={{
          width: '100%', height: '100%', objectFit: 'cover', opacity,
          transform: `translate(${driftX}%, ${driftY}%) scale(${zoom})`,
        }}
      />
      {/* Scrim: heavier at the bottom where headlines and captions sit. */}
      <AbsoluteFill style={{
        background: `linear-gradient(180deg, rgba(6,9,16,0.25) 0%, rgba(6,9,16,0.55) 55%, rgba(6,9,16,0.8) 100%)`,
      }} />
    </AbsoluteFill>
  );
};
