import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { Frame } from '../brand/Frame';
import { colors, type as t, space, glow } from '../brand/tokens';
import { monoFamily } from '../brand/fonts';
import type { Scene } from '../VideoRoot';
import { Logo } from '../brand/Logo';
import { ImageScene } from './ImageScene';
import { CinematicScenes } from './Cinematic';
import { Background, type BackgroundKind } from '../brand/backgrounds';

/** A scene's chosen background, falling back to the default for its type. */
const bgOf = (s: { background?: BackgroundKind }, fallback: BackgroundKind): BackgroundKind =>
  s.background ?? fallback;

/** Staggered entrance: opacity fade + upward drift. Used for secondary copy. */
const useEntrance = (delayFrames: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delayFrames, fps, config: { damping: 200 } });
  return {
    opacity: interpolate(s, [0, 1], [0, 1], { extrapolateRight: 'clamp' }),
    transform: `translateY(${interpolate(s, [0, 1], [24, 0], { extrapolateRight: 'clamp' })}px)`,
  };
};

/**
 * One glyph that pops in: scale from small + slight rise. Everything is a
 * deterministic function of (frame - delay); no Math.random(), so frames
 * render identically across parallel brand workers.
 */
const PopChar: React.FC<{ ch: string; delay: number; rise: number }> = ({ ch, delay, rise }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 11, mass: 0.55 } });
  const scale = interpolate(s, [0, 1], [0.25, 1], { extrapolateRight: 'clamp' });
  return (
    <span
      style={{
        display: 'inline-block',
        whiteSpace: 'pre',
        transform: `translateY(${(1 - s) * rise}px) scale(${scale})`,
        opacity: interpolate(s, [0, 0.32], [0, 1], { extrapolateRight: 'clamp' }),
        willChange: 'opacity, transform',
      }}
    >
      {ch}
    </span>
  );
};

/**
 * Kinetic text: pops glyphs (split='chars') or whole words (split='words')
 * in on a cascading delay. Deterministic per-unit stagger derived from the
 * string index — never wall-clock.
 */
const Kinetic: React.FC<{
  text: string;
  delay?: number;
  stagger?: number;
  rise?: number;
  split?: 'chars' | 'words';
  style?: React.CSSProperties;
}> = ({ text, delay = 0, stagger = 4, rise = 26, split = 'chars', style }) => {
  const words = text.split(' ');
  let ci = 0; // running glyph index across the whole phrase for one cascade
  return (
    <span style={{ display: 'inline-flex', flexWrap: 'wrap', ...style }}>
      {words.map((word, wi) => {
        const units = split === 'chars' ? Array.from(word) : [word];
        return (
          <span key={wi} style={{ display: 'inline-flex', whiteSpace: 'nowrap' }}>
            {units.map((unit, i) => {
              // chars mode: continuous cascade across the phrase
              const d = split === 'chars' ? delay + stagger * ci++ : delay + stagger * wi;
              return <PopChar key={i} ch={unit} delay={d} rise={rise} />;
            })}
            {wi < words.length - 1 ? (
              <span style={{ display: 'inline-block', width: '0.28em' }}>&nbsp;</span>
            ) : null}
          </span>
        );
      })}
    </span>
  );
};

const Eyebrow: React.FC<{ children: string; delay?: number }> = ({ children, delay = 0 }) => (
  <div
    style={{
      fontFamily: monoFamily,
      fontSize: t.label,
      letterSpacing: t.tracking.label,
      color: colors.accentBlue,
      textTransform: 'uppercase',
      marginBottom: space.md,
    }}
  >
    <Kinetic text={children} delay={delay} stagger={3} rise={14} />
  </div>
);

const Rule: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  return (
    <div style={{ height: 4, width: `${interpolate(s, [0, 1], [0, 18], { extrapolateRight: 'clamp' })}%`,
      backgroundColor: colors.accentOrange, marginTop: space.lg,
      boxShadow: glow(colors.accentOrange, 0.5) }} />
  );
};

const TitleScene: React.FC<{ s: Extract<Scene, { kind: 'title' }> }> = ({ s }) => {
  const photo = s.backgroundImage;
  return (
    <Frame backdrop={!photo} backdropOpacity={0.4}
      backgroundKind={photo ? undefined : bgOf(s, 'aurora')}>
      {photo ? (
        <>
          <Img src={staticFile(photo)} style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover',
          }} />
          {/* Dim so the white headline stays legible over the render. */}
          <AbsoluteFill style={{ backgroundColor: 'rgba(6,9,16,0.30)' }} />
        </>
      ) : null}
      {s.eyebrow ? <Eyebrow>{s.eyebrow}</Eyebrow> : null}
      <div style={{ fontSize: t.hero, fontWeight: t.weight.bold,
        letterSpacing: t.tracking.display, lineHeight: t.lineHeight.display }}>
        <Kinetic text={s.headline} delay={6} stagger={4} rise={36} />
      </div>
      {s.subhead ? (
        <div style={{ fontSize: t.h3, color: colors.textMuted, marginTop: space.md }}>
          <Kinetic text={s.subhead} delay={18} stagger={3} rise={12} split="words" />
        </div>
      ) : null}
      <Rule delay={34} />
    </Frame>
  );
};

/**
 * Counts a numeric value up from zero, preserving any suffix or prefix.
 * "2.4x" -> counts 0.0..2.4 then appends "x". Decimal places are taken from
 * the source string, so "150" counts in whole numbers and "2.4" in tenths.
 */
const useCountUp = (value: string, delay: number, frames: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const m = value.match(/^([^0-9.-]*)(-?[\d,]*\.?\d+)(.*)$/);
  if (!m) return { text: value, progress: 1 };
  const [, prefix, numStr, suffix] = m;
  const target = parseFloat(numStr.replace(/,/g, ''));
  const dp = numStr.includes('.') ? numStr.split('.')[1].length : 0;
  const p = spring({ frame: frame - delay, fps,
    durationInFrames: frames, config: { damping: 200 } });
  const shown = (target * p).toFixed(dp);
  return { text: prefix + shown + suffix, progress: p };
};

/** Big number that counts up AND slams in via an under-damped spring overshoot. */
const StatValue: React.FC<{ s: Extract<Scene, { kind: 'stat' }> }> = ({ s }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const count = useCountUp(s.value, 6, 22);
  const slam = spring({ frame: frame - 6, fps, config: { damping: 9, mass: 0.9 } });
  return (
    <div style={{
      fontSize: 168, fontWeight: t.weight.bold, color: colors.accentBlue,
      letterSpacing: t.tracking.display, lineHeight: 1, textAlign: 'center',
      textShadow: glow(colors.accentBlue, 0.4 + 0.5* count.progress),
      transform: `scale(${interpolate(slam, [0, 1], [2.4, 1], { extrapolateRight:'clamp'})}`,
      transformOrigin: 'center center',
      opacity: interpolate(slam, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' }),
    }}>
          {count.text}
        </div>
      );
    };

const StatScene: React.FC<{ s: Extract<Scene, { kind: 'stat' }> }> = ({ s }) => {
  const lab = useEntrance(16);
  return (
    <Frame backdrop backgroundKind={bgOf(s, 'halo')}>
      <StatValue s={s} />
      <div style={{ ...lab, fontSize: t.h2, marginTop: space.md, textAlign: 'center' }}>{s.label}</div>
      {s.source ? (
        <div style={{ ...lab, fontFamily: monoFamily, fontSize: t.label,
          color: colors.textMuted, marginTop: space.sm, textAlign: 'center' }}>
          {s.source}
        </div>
      ) : null}
    </Frame>
  );
};

/**
 * A ring that fills, then draws a tick. strokeDashoffset animated from the
 * path length to zero is what makes the stroke appear to draw itself.
 */
const Check: React.FC<{ color: string; delay: number }> = ({ color, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  const draw = spring({ frame: frame - delay - 5, fps,
    durationInFrames: 14, config: { damping: 200 } });
  const LEN = 20;
  return (
    <svg width={34} height={34} viewBox="0 0 34 34"
      style={{ marginTop: 10, flexShrink: 0, filter: `drop-shadow(0 0 6px ${color})` }}>
      <circle cx={17} cy={17} r={15} fill="none" stroke={color} strokeWidth={2.5}
        opacity={0.35 + 0.65 * p} />
      <circle cx={17} cy={17} r={15 * p} fill={color} opacity={0.18} />
      <path d="M10 17.5 L15 22.5 L24 12" fill="none" stroke={color}
        strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray={LEN} strokeDashoffset={LEN * (1 - draw)} />
    </svg>
  );
};

/** Own component so hooks are top-level, not in a loop. Kicks in with a slide+pop. */
const BulletRow: React.FC<{ text: string; index: number }> = ({ text, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const delay = 8 + index * 8;
  const s = spring({ frame: frame - delay, fps, config: { damping: 12, mass: 0.6 } });
  const dot = index === 0 ? colors.accentOrange : colors.accentBlue;
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: space.md, marginBottom: space.lg,
      transform: `translateX(${(1 - s) * -20}px) scale(${1 - 0.12 * (1 - s)})`,
      opacity: interpolate(s, [0, 0.32], [0, 1], { extrapolateRight: 'clamp' }),
    }}>
      <Check color={dot} delay={delay} />
      <div style={{ fontSize: t.h3, fontWeight: t.weight.medium }}>{text}</div>
    </div>
  );
};

const BulletsScene: React.FC<{ s: Extract<Scene, { kind: 'bullets' }> }> = ({ s }) => (
  <Frame backdrop backgroundKind={bgOf(s, 'wave')}>
    {s.heading ? <Eyebrow>{s.heading}</Eyebrow> : null}
    {s.items.map((item, i) => <BulletRow key={i} text={item} index={i} />)}
  </Frame>
);

/** A plain Vector Verdicts text line — no pill box. Staggered entrance. */
const SpecLine: React.FC<{ text: string; index: number }> = ({ text, index }) => {
  const anim = useEntrance(6 + index * 6);
  return (
    <div style={{ ...anim, fontSize: t.h3, fontWeight: t.weight.medium, color: colors.white,
      lineHeight: t.lineHeight.body, marginBottom: space.xs }}>
      {text}
    </div>
  );
};

const SpecsScene: React.FC<{ s: Extract<Scene, { kind: 'specs' }> }> = ({ s }) => (
  <Frame backgroundKind={bgOf(s, 'aperture')}>
    {/* Render the aperture cleanly (no constellation/scrim stacking over it). */}
    <Background kind={bgOf(s, 'aperture')} bg={colors.bg} />
    {s.heading ? <Eyebrow>{s.heading}</Eyebrow> : null}
    {s.items.map((item, i) => <SpecLine key={i} text={item} index={i} />)}
  </Frame>
);

const OutroScene: React.FC<{ s: Extract<Scene, { kind: 'outro' }> }> = ({ s }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slight scale-up so the mark lands rather than simply appearing.
  const pop = spring({ frame: frame - 2, fps, config: { damping: 180 } });
  const scale = interpolate(pop, [0, 1], [0.86, 1], { extrapolateRight: 'clamp' });

  return (
    <Frame backdrop backdropOpacity={0.4} backgroundKind={bgOf(s, 'orb')}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ transform: `scale(${scale})`, opacity: interpolate(pop, [0, 0.35], [0, 1], { extrapolateRight: 'clamp' }) }}>
          <Logo scale={0.44} variant="mark" />
        </div>
        <div style={{ height: 4, width: 120, marginTop: space.md,
          background: `linear-gradient(90deg, ${colors.accentBlue}, ${colors.accentOrange})`,
          boxShadow: glow(colors.accentBlue, 0.4) }} />
        {s.message ? (
          <div style={{ fontSize: t.h3, color: colors.textMuted,
            marginTop: space.md, textAlign: 'center' }}>
            <Kinetic text={s.message} delay={12} stagger={5} rise={20} />
          </div>
        ) : null}
      </div>
    </Frame>
  );
};

export const SceneRenderer: React.FC<{ scene: Scene }> = ({ scene }) => {
  switch (scene.kind) {
    case 'title': return <TitleScene s={scene} />;
    case 'stat': return <StatScene s={scene} />;
    case 'bullets': return <BulletsScene s={scene} />;
    case 'specs': return <SpecsScene s={scene} />;
    case 'image': return <ImageScene s={scene} />;
        case 'outro': return <OutroScene s={scene} />;
        case 'terminal':
        case 'grid':
        case 'mapzoom':
        case 'glitch': return <CinematicScenes scene={scene} />;
  }
};