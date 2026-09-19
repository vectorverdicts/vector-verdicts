import React from 'react';
import { Composition } from 'remotion';
import { formats } from './brand/tokens';
import { waitForFonts } from './brand/fonts';
import { VideoRoot, videoSchema, defaultVideoProps, totalFrames } from './VideoRoot';

/**
 * Both formats render the SAME component tree. Only the dimensions differ.
 * Scenes adapt via useVideoConfig() rather than branching on format.
 */
const FPS = formats.short.fps;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id={formats.short.id}
        component={VideoRoot}
        schema={videoSchema}
        defaultProps={defaultVideoProps}
        durationInFrames={90 * formats.short.fps}
        fps={formats.short.fps}
        width={formats.short.width}
        height={formats.short.height}
        // Runs before render; Remotion awaits it. Fonts are guaranteed
        // registered before any frame is rasterised.
        calculateMetadata={async ({ props }) => {
          await waitForFonts();
          return { durationInFrames: totalFrames(props.scenes, FPS) };
        }}
      />
      <Composition
        id={formats.long.id}
        component={VideoRoot}
        schema={videoSchema}
        defaultProps={defaultVideoProps}
        durationInFrames={90 * formats.long.fps}
        fps={formats.long.fps}
        width={formats.long.width}
        height={formats.long.height}
        calculateMetadata={async ({ props }) => {
          await waitForFonts();
          return { durationInFrames: totalFrames(props.scenes, FPS) };
        }}
      />
    </>
  );
};
