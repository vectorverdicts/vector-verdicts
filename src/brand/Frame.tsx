import React from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import { colors, CLEAR_SPACE_RATIO, type } from './tokens';
import { interFamily } from './fonts';

/**
 * The shell every scene renders inside: canvas colour, safe-area insets,
 * and base typography. Scenes should never set their own background.
 */
export const Frame: React.FC<{
  children: React.ReactNode;
  /** Set false for full-bleed scenes (B-roll, end cards). */
  padded?: boolean;
}> = ({ children, padded = true }) => {
  const { width, height } = useVideoConfig();

  // Derived from the SHORT edge (1080 in both formats) so vertical and
  // horizontal outputs get identical margins. Using width would give 16:9
  // a visibly larger inset than 9:16.
  const inset = Math.min(width, height) * CLEAR_SPACE_RATIO;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg,
        fontFamily: interFamily,
        color: colors.white,
        lineHeight: type.lineHeight.body,
      }}
    >
      <AbsoluteFill
        style={{
          padding: padded ? inset : 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
