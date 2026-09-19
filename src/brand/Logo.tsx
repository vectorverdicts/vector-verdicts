import React, { useCallback, useState } from 'react';
import { Img, staticFile, useVideoConfig, delayRender, continueRender } from 'remotion';

/**
 * The Vector Verdicts mark.
 *
 * The PNG carries its own background (#060910), which is why tokens.ts uses
 * that same measured value for the canvas — the mark blends seamlessly rather
 * than showing as a rectangle.
 */
export const Logo: React.FC<{
  /** Fraction of the frame's SHORT edge. Same rule as Frame's insets, so the
   *  mark is the same physical size in both 9:16 and 16:9. */
  scale?: number;
  style?: React.CSSProperties;
}> = ({ scale = 0.45, style }) => {
  const { width, height } = useVideoConfig();
  const size = Math.min(width, height) * scale;

  // Hold the frame until the image decodes. Remotion rasterises as soon as
  // React settles, so without this a worker can capture a frame with no logo.
  const [handle] = useState(() => delayRender('loading logo'));
  const onLoad = useCallback(() => continueRender(handle), [handle]);
  const onError = useCallback(() => continueRender(handle), [handle]);

  return (
    <Img
      src={staticFile('logo.png')}
      onLoad={onLoad}
      onError={onError}
      style={{ width: size, height: size, objectFit: 'contain', ...style }}
    />
  );
};
