import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { Frame } from '../brand/Frame';
import { colors, type as t, space, glow } from '../brand/tokens';
import { monoFamily } from '../brand/fonts';
import type { Scene } from '../VideoRoot';
import { Logo } from '../brand/Logo';
import { ImageScene } from './ImageScene';
import type { BackgroundKind } from '../brand/backgrounds';


/** A scene's chosen background, falling back to the default for its type. */
const bgOf = (s: { background?: BackgroundKind }, fallback: BackgroundKind): BackgroundKind =>
  s.background ?? fallback;

/** Staggered entrance: opacity fade + upward drift. */
const useEntrance = (delayFrames: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delayFrames, fps, config: { damping: 200 } });
  return {
    opacity: interpolate(s, [0, 1], [0, 1], { extrapolateRight: 'clamp' }),
    transform: `translateY(${interpolate(s, [0, 1], [24, 0], { extrapolateRight: 'clamp' })}px)`,
  };
};

const Eyebrow: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const anim = useEntrance(delay);
  return (
    <div style={{ ...anim, fontFamily: monoFamily, fontSize: t.label,
      letterSpacing: t.tracking.label, color: colors.accentBlue,
      textTransform: 'uppercase', marginBottom: space.md }}>
      {children}
    </div>
  );
};

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
  const head = useEntrance(6);
  const sub = useEntrance(14);
  return (
    <Frame backdrop backdropOpacity={0.4} backgroundKind={bgOf(s, 'aurora')}>
      {s.eyebrow ? <Eyebrow>{s.eyebrow}</Eyebrow> : null}
      <div style={{ ...head, fontSize: t.hero, fontWeight: t.weight.bold,
        letterSpacing: t.tracking.display, lineHeight: t.lineHeight.display }}>
        {s.headline}
      </div>
      {s.subhead ? (
        <div style={{ ...sub, fontSize: t.h3, color: colors.textMuted, marginTop: space.md }}>
          {s.subhead}
        </div>
      ) : null}
      <Rule delay={18} />
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

const StatScene: React.FC<{ s: Extract<Scene, { kind: 'stat' }> }> = ({ s }) => {
  const val = useEntrance(4);
  const lab = useEntrance(12);
  const count = useCountUp(s.value, 4, 26);
  return (
    <Frame backdrop backgroundKind={bgOf(s, 'halo')}>
      <div style={{ ...val, fontSize: 168, fontWeight: t.weight.bold,
        color: colors.accentBlue, letterSpacing: t.tracking.display,
        lineHeight: 1, textShadow: glow(colors.accentBlue, 0.4 + 0.5 * count.progress) }}>
        {count.text}
      </div>
      <div style={{ ...lab, fontSize: t.h2, marginTop: space.md }}>{s.label}</div>
      {s.source ? (
        <div style={{ ...lab, fontFamily: monoFamily, fontSize: t.label,
          color: colors.textMuted, marginTop: space.sm }}>
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

/** Own component so useEntrance is a top-level hook, not a hook in a loop. */
const BulletRow: React.FC<{ text: string; index: number }> = ({ text, index }) => {
  const anim = useEntrance(8 + index * 9);
  const dot = index === 0 ? colors.accentOrange : colors.accentBlue;
  return (
    <div style={{ ...anim, display: 'flex', alignItems: 'flex-start',
      gap: space.md, marginBottom: space.lg }}>
      <Check color={dot} delay={8 + index * 9} />
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

const OutroScene: React.FC<{ s: Extract<Scene, { kind: 'outro' }> }> = ({ s }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const anim = useEntrance(2);
  const text = useEntrance(14);

  // Slight scale-up so the mark lands rather than simply appearing.
  const pop = spring({ frame: frame - 2, fps, config: { damping: 180 } });
  const scale = interpolate(pop, [0, 1], [0.86, 1], { extrapolateRight: 'clamp' });

  return (
    <Frame backdrop backdropOpacity={0.4} backgroundKind={bgOf(s, 'orb')}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ ...anim, transform: `${anim.transform} scale(${scale})` }}>
          <Logo scale={0.44} variant="mark" />
        </div>
        <div style={{ height: 4, width: 120, marginTop: space.md,
          background: `linear-gradient(90deg, ${colors.accentBlue}, ${colors.accentOrange})`,
          boxShadow: glow(colors.accentBlue, 0.4) }} />
        {s.message ? (
          <div style={{ ...text, fontSize: t.h3, color: colors.textMuted,
            marginTop: space.md, textAlign: 'center' }}>
            {s.message}
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
    case 'image': return <ImageScene s={scene} />;
    case 'outro': return <OutroScene s={scene} />;
  }
};
