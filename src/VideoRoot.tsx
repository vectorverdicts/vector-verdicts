import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { colors } from './brand/tokens';
import { SceneRenderer } from './scenes';
import { Audio, staticFile } from 'remotion';
import { deriveWindows } from './audio/timing';
import { Captions } from './audio/Captions';

/** Each scene carries `kind`; TypeScript and Zod both narrow on it. */
const sceneSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('title'),
    seconds: z.number().positive(),
    narration: z.string().optional(),
    /** Animated background for this scene. Defaults per scene type. */
    background: z.enum(['aurora','orb','halo','wave','mesh','aperture']).optional(),
    eyebrow: z.string().optional(),
    /** Full-bleed background image (public/ path) rendered behind title text. */
    backgroundImage: z.string().optional(),
    headline: z.string(),
    subhead: z.string().optional(),
  }),
  z.object({
    kind: z.literal('stat'),
    seconds: z.number().positive(),
    narration: z.string().optional(),
    /** Animated background for this scene. Defaults per scene type. */
    background: z.enum(['aurora','orb','halo','wave','mesh','aperture']).optional(),
    value: z.string(),
    label: z.string(),
    source: z.string().optional(),
  }),
  z.object({
    kind: z.literal('bullets'),
    seconds: z.number().positive(),
    narration: z.string().optional(),
    /** Animated background for this scene. Defaults per scene type. */
    background: z.enum(['aurora','orb','halo','wave','mesh','aperture']).optional(),
    heading: z.string().optional(),
    items: z.array(z.string()).min(1).max(5),
  }),
  z.object({
    kind: z.literal('image'),
    seconds: z.number().positive(),
    narration: z.string().optional(),
    /** Animated background for this scene. Defaults per scene type. */
    background: z.enum(['aurora','orb','halo','wave','mesh','aperture']).optional(),
    /** Path relative to public/, e.g. "images/ep002-benchmark.png". */
    src: z.string(),
    caption: z.string().optional(),
    /** 'contain' shows the whole image (right for screenshots and charts);
     *  'cover' crops to fill the frame (right for photos and textures). */
    fit: z.enum(['contain', 'cover']).optional(),
  }),
  z.object({
    kind: z.literal('specs'),
    seconds: z.number().positive(),
    narration: z.string().optional(),
    /** Animated background for this scene (aperture suits the camera talk). */
    background: z.enum(['aurora','orb','halo','wave','mesh','aperture']).optional(),
    heading: z.string().optional(),
    /** Feature pills, like "2nm A20 Pro chip". Up to 8. */
    items: z.array(z.string()).min(1).max(8),
  }),
  z.object({
    kind: z.literal('outro'),
    seconds: z.number().positive(),
    narration: z.string().optional(),
    /** Animated background for this scene. Defaults per scene type. */
    background: z.enum(['aurora','orb','halo','wave','mesh','aperture']).optional(),
    message: z.string(),
  }),
]);

const wordSchema = z.object({
  word: z.string(),
  start: z.number(),
  end: z.number(),
});

export const videoSchema = z.object({
  title: z.string(),
  scenes: z.array(sceneSchema).min(1),
  /** staticFile() path to the narration track. */
  audioSrc: z.string().optional(),
  /** Word-level timings from whisper. When present, these drive scene
   *  boundaries and `seconds` is ignored. */
  words: z.array(wordSchema).optional(),
});

export type VideoProps = z.infer<typeof videoSchema>;
export type Scene = z.infer<typeof sceneSchema>;

/** Synthetic timings at ~175 wpm. Replaced by real whisper output per episode. */
const stubWords = (text: string, startAt: number) => {
  const RATE = 0.34;
  return text.split(/\s+/).filter(Boolean).map((word, i) => ({
    word,
    start: +(startAt + i * RATE).toFixed(3),
    end: +(startAt + i * RATE + RATE * 0.9).toFixed(3),
  }));
};

const NARRATION = [
  'Google just shipped Gemini three point eight Flash and the benchmarks are loud.',
  'It runs two point four times faster than the model it replaces.',
  'Three things actually matter here. It is cheaper per token, the context window is longer, and tool use still lags behind.',
  'That is the verdict. Vector Verdicts.',
];

const buildStub = () => {
  const words: { word: string; start: number; end: number }[] = [];
  let t = 0;
  for (const line of NARRATION) {
    const w = stubWords(line, t);
    words.push(...w);
    t = w[w.length - 1].end + 0.35;
  }
  return words;
};

export const defaultVideoProps: VideoProps = {
  title: 'Sample Episode',
  words: buildStub(),
  scenes: [
    { kind: 'title', seconds: 4, eyebrow: 'MODEL RELEASE',
      headline: 'Gemini 3.8 Flash', subhead: 'What actually changed',
      narration: NARRATION[0] },
    { kind: 'stat', seconds: 3, value: '2.4x', label: 'faster inference',
      source: 'vendor benchmark', narration: NARRATION[1] },
    { kind: 'bullets', seconds: 5, heading: 'The short version',
      items: ['Cheaper per token', 'Longer context window', 'Still no tool-use parity'],
      narration: NARRATION[2] },
    { kind: 'outro', seconds: 3, message: 'Vector Verdicts',
      narration: NARRATION[3] },
  ],
};


export const VideoRoot: React.FC<VideoProps> = ({ scenes, audioSrc, words }) => {
  const { fps } = useVideoConfig();

  // Derived timing when whisper output is present; authored seconds otherwise.
  const windows = words?.length
    ? deriveWindows(scenes.map((s) => s.narration ?? ''), words)
    : null;

  let cursor = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      {audioSrc ? <Audio src={staticFile(audioSrc)} /> : null}
      {words?.length ? <Captions words={words} /> : null}
      {scenes.map((scene, i) => {
        let from: number;
        let dur: number;

        if (windows) {
          // Seconds -> integer frames. Remotion renders discrete frames;
          // a fractional `from` truncates and drifts scenes.
          from = Math.round(windows[i].startSec * fps);
          dur = Math.max(1, Math.round(windows[i].endSec * fps) - from);
        } else {
          from = cursor;
          dur = Math.round(scene.seconds * fps);
          cursor += dur;
        }

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
export const totalFrames = (
  scenes: Scene[],
  fps: number,
  words?: { word: string; start: number; end: number }[],
): number => {
  if (words?.length) {
    const w = deriveWindows(scenes.map((s) => s.narration ?? ''), words);
    return Math.round(w[w.length - 1].endSec * fps);
  }
  return scenes.reduce((sum, s) => sum + Math.round(s.seconds * fps), 0);
};
