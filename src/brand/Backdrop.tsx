import React, { useCallback, useState } from 'react';
import { AbsoluteFill, Img, staticFile, delayRender, continueRender } from 'remotion';
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

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      <Img
        src={staticFile('bg-constellation.jpg')}
        onLoad={done}
        onError={done}
        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity }}
      />
      {/* Scrim: heavier at the bottom where headlines and captions sit. */}
      <AbsoluteFill style={{
        background: `linear-gradient(180deg, rgba(6,9,16,0.25) 0%, rgba(6,9,16,0.55) 55%, rgba(6,9,16,0.8) 100%)`,
      }} />
    </AbsoluteFill>
  );
};
