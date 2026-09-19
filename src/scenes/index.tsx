import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { Frame } from '../brand/Frame';
import { colors, type as t, space, glow } from '../brand/tokens';
import { monoFamily } from '../brand/fonts';
import type { Scene } from '../VideoRoot';

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
    <Frame>
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

const StatScene: React.FC<{ s: Extract<Scene, { kind: 'stat' }> }> = ({ s }) => {
  const val = useEntrance(4);
  const lab = useEntrance(12);
  return (
    <Frame>
      <div style={{ ...val, fontSize: 168, fontWeight: t.weight.bold,
        color: colors.accentBlue, letterSpacing: t.tracking.display,
        lineHeight: 1, textShadow: glow(colors.accentBlue, 0.6) }}>
        {s.value}
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

/** Own component so useEntrance is a top-level hook, not a hook in a loop. */
const BulletRow: React.FC<{ text: string; index: number }> = ({ text, index }) => {
  const anim = useEntrance(8 + index * 9);
  const dot = index === 0 ? colors.accentOrange : colors.accentBlue;
  return (
    <div style={{ ...anim, display: 'flex', alignItems: 'flex-start',
      gap: space.md, marginBottom: space.lg }}>
      <div style={{ width: 14, height: 14, borderRadius: 7, marginTop: 16,
        flexShrink: 0, backgroundColor: dot, boxShadow: glow(dot, 0.4) }} />
      <div style={{ fontSize: t.h3, fontWeight: t.weight.medium }}>{text}</div>
    </div>
  );
};

const BulletsScene: React.FC<{ s: Extract<Scene, { kind: 'bullets' }> }> = ({ s }) => (
  <Frame>
    {s.heading ? <Eyebrow>{s.heading}</Eyebrow> : null}
    {s.items.map((item, i) => <BulletRow key={i} text={item} index={i} />)}
  </Frame>
);

const OutroScene: React.FC<{ s: Extract<Scene, { kind: 'outro' }> }> = ({ s }) => {
  const anim = useEntrance(4);
  return (
    <Frame>
      <div style={{ ...anim, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ fontSize: t.h1, fontWeight: t.weight.bold,
          letterSpacing: t.tracking.display, textAlign: 'center' }}>
          {s.message}
        </div>
        <div style={{ height: 4, width: 120, marginTop: space.lg,
          background: `linear-gradient(90deg, ${colors.accentBlue}, ${colors.accentOrange})`,
          boxShadow: glow(colors.accentBlue, 0.4) }} />
      </div>
    </Frame>
  );
};

export const SceneRenderer: React.FC<{ scene: Scene }> = ({ scene }) => {
  switch (scene.kind) {
    case 'title': return <TitleScene s={scene} />;
    case 'stat': return <StatScene s={scene} />;
    case 'bullets': return <BulletsScene s={scene} />;
    case 'outro': return <OutroScene s={scene} />;
  }
};
