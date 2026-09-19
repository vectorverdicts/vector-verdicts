import React, { useCallback, useState } from 'react';
import { Img, staticFile, useVideoConfig, delayRender, continueRender } from 'remotion';

/**
 * The Vector Verdicts mark, in two variants.
 *
 * The 'lockup' PNG carries its own background (#060910), which is why
 * tokens.ts uses that measured value for the canvas — it blends on a flat
 * canvas, but shows as a square over the constellation backdrop.
 *
 * The 'mark' PNG is alpha-cut from the source artwork (luminance keyed, glow
 * preserved in partial alpha), so it composites over anything.
 */
export const Logo: React.FC<{
  /** Fraction of the frame's SHORT edge. Same rule as Frame's insets, so the
   *  mark is the same physical size in both 9:16 and 16:9. */
  scale?: number;
  /**
   * 'lockup' — wireframe V plus the VECTOR VERDICTS wordmark, on its own
   *   opaque #060910 background. Matches the flat canvas; shows as a square
   *   over the constellation backdrop.
   * 'mark'   — the V alone, transparent PNG. Composites over anything.
   */
  variant?: 'lockup' | 'mark';
  style?: React.CSSProperties;
}> = ({ scale = 0.45, variant = 'lockup', style }) => {
  const { width, height } = useVideoConfig();
  const size = Math.min(width, height) * scale;

  // Hold the frame until the image decodes. Remotion rasterises as soon as
  // React settles, so without this a worker can capture a frame with no logo.
  const [handle] = useState(() => delayRender('loading logo'));
  const onLoad = useCallback(() => continueRender(handle), [handle]);
  const onError = useCallback(() => continueRender(handle), [handle]);

  return (
    <Img
      src={staticFile(variant === 'mark' ? 'logo-mark.png' : 'logo.png')}
      onLoad={onLoad}
      onError={onError}
      style={{ width: size, height: size, objectFit: 'contain', ...style }}
    />
  );
};
