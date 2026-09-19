import React, { useCallback, useState } from 'react';
import {
  AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig,
  interpolate, delayRender, continueRender,
} from 'remotion';
import { Frame } from '../brand/Frame';
import { colors, type as t, space } from '../brand/tokens';
import type { Scene } from '../VideoRoot';

/**
 * A supplied image — screenshot, chart, product shot.
 *
 * Slow Ken Burns push by default: a static frame held for several seconds
 * reads as dead air in a Short, and subtle motion fixes that without
 * competing for attention.
 */
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
          <div style={{
            fontSize: t.body, color: colors.white,
            background: 'rgba(6,9,16,0.82)',
            padding: `${space.sm}px ${space.md}px`,
            borderRadius: 8, borderLeft: `4px solid ${colors.accentBlue}`,
            textAlign: 'center', maxWidth: '90%',
          }}>
            {s.caption}
          </div>
        </AbsoluteFill>
      ) : null}
    </Frame>
  );
};
