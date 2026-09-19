import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { colors } from './brand/tokens';
import { SceneRenderer } from './scenes';

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
            <SceneRenderer scene={scene} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

/**
 * Total length of a scene list, in frames.
 * Rounds PER SCENE, matching VideoRoot's Sequence maths exactly — summing
 * seconds and rounding once would drift by a frame on fractional durations.
 */
export const totalFrames = (scenes: Scene[], fps: number): number =>
  scenes.reduce((sum, s) => sum + Math.round(s.seconds * fps), 0);
