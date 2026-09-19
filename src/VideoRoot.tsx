import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { Frame } from './brand/Frame';
import { colors, type as t, space } from './brand/tokens';
import { monoFamily } from './brand/fonts';

/** Each scene carries `kind`; TypeScript and Zod both narrow on it. */
const sceneSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('title'),
    seconds: z.number().positive(),
    eyebrow: z.string().optional(),
    headline: z.string(),
    subhead: z.string().optional(),
  }),
  z.object({
    kind: z.literal('stat'),
    seconds: z.number().positive(),
    value: z.string(),
    label: z.string(),
    source: z.string().optional(),
  }),
  z.object({
    kind: z.literal('bullets'),
    seconds: z.number().positive(),
    heading: z.string().optional(),
    items: z.array(z.string()).min(1).max(5),
  }),
  z.object({
    kind: z.literal('outro'),
    seconds: z.number().positive(),
    message: z.string(),
  }),
]);

export const videoSchema = z.object({
  title: z.string(),
  scenes: z.array(sceneSchema).min(1),
});

export type VideoProps = z.infer<typeof videoSchema>;
export type Scene = z.infer<typeof sceneSchema>;

export const defaultVideoProps: VideoProps = {
  title: 'Sample Episode',
  scenes: [
    { kind: 'title', seconds: 4, eyebrow: 'MODEL RELEASE',
      headline: 'Gemini 3.8 Flash', subhead: 'What actually changed' },
    { kind: 'stat', seconds: 3, value: '2.4x', label: 'faster inference',
      source: 'vendor benchmark' },
    { kind: 'bullets', seconds: 5, heading: 'The short version',
      items: ['Cheaper per token', 'Longer context window', 'Still no tool-use parity'] },
    { kind: 'outro', seconds: 3, message: 'Vector Verdicts' },
  ],
};

/** Placeholder renderer — replaced by real scene components next. */
const SceneBody: React.FC<{ scene: Scene }> = ({ scene }) => {
  const heading =
    scene.kind === 'title' ? scene.headline
    : scene.kind === 'stat' ? scene.value
    : scene.kind === 'bullets' ? (scene.heading ?? 'Points')
    : scene.message;

  return (
    <Frame>
      <div style={{ fontFamily: monoFamily, fontSize: t.label,
        letterSpacing: t.tracking.label, color: colors.accentBlue,
        marginBottom: space.md }}>
        {scene.kind.toUpperCase()}
      </div>
      <div style={{ fontSize: t.h1, fontWeight: t.weight.bold,
        letterSpacing: t.tracking.display, lineHeight: t.lineHeight.display }}>
        {heading}
      </div>
    </Frame>
  );
};

export const VideoRoot: React.FC<VideoProps> = ({ scenes }) => {
  const { fps } = useVideoConfig();
  let cursor = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      {scenes.map((scene, i) => {
        const from = cursor;
        const dur = Math.round(scene.seconds * fps);
        cursor += dur;
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <SceneBody scene={scene} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
