import React from 'react';
import { AbsoluteFill, Composition, Img, staticFile } from 'remotion';
import { colors, formats } from './brand/tokens';
import { waitForFonts } from './brand/fonts';
import { VideoRoot, videoSchema, defaultVideoProps, totalFrames } from './VideoRoot';
import { LivingRoom } from './scenes/act1/LivingRoom';
import { Grade } from './brand/Grade';

/**
 * Both formats render the SAME component tree. Only the dimensions differ.
 * Scenes adapt via useVideoConfig() rather than branching on format.
 */
const FPS = formats.short.fps;

/**
 * Throwaway split-screen: ungraded left, Grade-wrapped right, same still
 * both sides, so the grade's effect can be judged directly against the
 * unmodified source.
 */
const GRADE_PREVIEW_SRC = 'images/ep004-hero.png';

const GradePreview: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: colors.bg }}>
    <AbsoluteFill style={{ overflow: 'hidden', clipPath: 'inset(0 50% 0 0)' }}>
      <Img src={staticFile(GRADE_PREVIEW_SRC)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </AbsoluteFill>
    <AbsoluteFill style={{ overflow: 'hidden', clipPath: 'inset(0 0 0 50%)' }}>
      <Grade>
        <Img src={staticFile(GRADE_PREVIEW_SRC)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </Grade>
    </AbsoluteFill>
    <div style={{
      position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2,
      background: colors.white, opacity: 0.6, transform: 'translateX(-1px)',
    }} />
  </AbsoluteFill>
);

/**
 * Throwaway split-screen: two DIFFERENT stills, both Grade-wrapped with
 * identical default props, split down the middle. Unlike GradePreview (one
 * image, graded vs. not), this checks the grade's actual job — that two
 * separately-generated frames read as one consistent look once graded.
 */
const CONSISTENCY_PREVIEW_LEFT = 'images/ep004-hero.png';
const CONSISTENCY_PREVIEW_RIGHT = 'images/courtroom.png';

const GradeConsistencyPreview: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: colors.bg }}>
    <AbsoluteFill style={{ overflow: 'hidden', clipPath: 'inset(0 50% 0 0)' }}>
      <Grade>
        <Img src={staticFile(CONSISTENCY_PREVIEW_LEFT)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </Grade>
    </AbsoluteFill>
    <AbsoluteFill style={{ overflow: 'hidden', clipPath: 'inset(0 0 0 50%)' }}>
      <Grade>
        <Img src={staticFile(CONSISTENCY_PREVIEW_RIGHT)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </Grade>
    </AbsoluteFill>
    <div style={{
      position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2,
      background: colors.white, opacity: 0.6, transform: 'translateX(-1px)',
    }} />
  </AbsoluteFill>
);

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
          return { durationInFrames: totalFrames(props.scenes, FPS, props.words, props.duration) };
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
          return { durationInFrames: totalFrames(props.scenes, FPS, props.words, props.duration) };
        }}
      />
      {/* Throwaway preview — not part of the episode pipeline, just for
          eyeballing the act1 living-room set/lighting in Studio. */}
      <Composition
        id="Preview-Act1LivingRoom"
        component={LivingRoom}
        durationInFrames={150}
        fps={formats.long.fps}
        width={formats.long.width}
        height={formats.long.height}
        defaultProps={{ dollyX: 0, tvGlow: 0.6, lampWarmth: 0.8 }}
      />
      {/* Throwaway preview — ungraded vs. Grade-wrapped, split down the
          middle, for judging the colour grade in Studio. */}
      <Composition
        id="Preview-Grade"
        component={GradePreview}
        durationInFrames={150}
        fps={formats.long.fps}
        width={formats.long.width}
        height={formats.long.height}
      />
      {/* Throwaway preview — two different stills, both graded with
          identical default props, split down the middle, for judging
          whether the grade actually makes separately-generated frames cut
          together. */}
      <Composition
        id="Preview-GradeConsistency"
        component={GradeConsistencyPreview}
        durationInFrames={150}
        fps={formats.long.fps}
        width={formats.long.width}
        height={formats.long.height}
      />
    </>
  );
};
