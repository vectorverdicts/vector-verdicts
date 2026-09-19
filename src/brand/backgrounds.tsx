import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

/**
 * Animated backgrounds, ported from CSS keyframes to frame-driven values.
 *
 * Nothing here uses CSS `animation` — Remotion renders frames out of order
 * across parallel workers, so wall-clock-driven animation would desync.
 * Every value is computed from the current frame instead.
 */

export type BackgroundKind = 'aurora' | 'orb' | 'halo' | 'wave' | 'mesh' | 'aperture';

const BLUE = '16,192,254';
const ORANGE = '255,88,35';

/** Two soft blooms on slow offset cycles. Calm; never visibly repeats. */
const Aurora: React.FC<{ t: number }> = ({ t }) => {
  const bx = 30 + 18 * Math.sin(t * 0.13);
  const by = 28 + 14 * Math.cos(t * 0.09);
  const ox = 72 + 16 * Math.sin(t * 0.11 + 2.1);
  const oy = 68 + 12 * Math.cos(t * 0.15 + 1.3);
  return (
    <AbsoluteFill style={{
      filter: 'blur(14px)',
      background:
        `radial-gradient(60% 45% at ${bx}% ${by}%, rgba(${BLUE},0.42) 0%, rgba(${BLUE},0) 68%),` +
        `radial-gradient(55% 42% at ${ox}% ${oy}%, rgba(${ORANGE},0.32) 0%, rgba(${ORANGE},0) 65%)`,
    }} />
  );
};

/** One breathing sphere. Strong focus — suits a single stat, not a list. */
const Orb: React.FC<{ t: number }> = ({ t }) => {
  const scale = 1.02 + 0.10 * Math.sin(t * 0.7);
  const lift = -2 * Math.sin(t * 0.7);
  return (
    <AbsoluteFill style={{ display: 'grid', placeItems: 'center' }}>
      <div style={{
        width: '58%', aspectRatio: '1', borderRadius: '50%',
        filter: 'blur(26px)',
        transform: `scale(${scale}) translateY(${lift}%)`,
        background: `radial-gradient(circle at 38% 34%,` +
          `rgba(${BLUE},0.85) 0%, rgba(${BLUE},0.35) 38%,` +
          `rgba(${ORANGE},0.28) 62%, rgba(${ORANGE},0) 78%)`,
      }} />
    </AbsoluteFill>
  );
};

/** Rotating conic ring with a dark core. Reads as "processing". */
const Halo: React.FC<{ t: number; bg: string }> = ({ t, bg }) => {
  const deg = (t * 16.4) % 360;
  return (
    <AbsoluteFill style={{ display: 'grid', placeItems: 'center' }}>
      <div style={{
        width: '76%', aspectRatio: '1', borderRadius: '50%',
        filter: 'blur(22px)', transform: `rotate(${deg}deg)`,
        background: `conic-gradient(from 0deg,` +
          `rgba(${BLUE},0) 0deg, rgba(${BLUE},0.75) 70deg,` +
          `rgba(255,255,255,0.5) 140deg, rgba(${ORANGE},0.7) 220deg,` +
          `rgba(${ORANGE},0) 330deg, rgba(${BLUE},0) 360deg)`,
      }} />
      <div style={{
        position: 'absolute', width: '44%', aspectRatio: '1',
        borderRadius: '50%', background: bg, filter: 'blur(18px)',
      }} />
    </AbsoluteFill>
  );
};

/** Stacked bands rolling at different speeds. Horizontal motion suits lists. */
const Wave: React.FC<{ t: number }> = ({ t }) => {
  const bands = [
    { top: '18%', rgb: BLUE, a: 0.45, period: 14, dir: 1 },
    { top: '42%', rgb: ORANGE, a: 0.34, period: 19, dir: -1 },
    { top: '62%', rgb: BLUE, a: 0.24, period: 24, dir: 1 },
  ];
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {bands.map((b, i) => {
        const phase = Math.sin((t / b.period) * Math.PI * 2) * b.dir;
        return (
          <div key={i} style={{
            position: 'absolute', left: '-30%', right: '-30%',
            top: b.top, height: '46%', borderRadius: '45%',
            filter: 'blur(20px)',
            background: `rgba(${b.rgb},${b.a})`,
            transform: `translateX(${phase * 8}%) rotate(${phase * 3}deg)`,
          }} />
        );
      })}
    </AbsoluteFill>
  );
};

/** Four corner blooms on offset cycles. The busiest option. */
const Mesh: React.FC<{ t: number }> = ({ t }) => {
  const blobs = [
    { top: '-8%', left: '-10%', rgb: BLUE, a: 0.50, period: 16, dir: 1 },
    { top: '12%', right: '-14%', rgb: ORANGE, a: 0.42, period: 21, dir: -1 },
    { bottom: '-6%', left: '4%', rgb: ORANGE, a: 0.30, period: 26, dir: 1 },
    { bottom: '16%', right: '-8%', rgb: BLUE, a: 0.34, period: 19, dir: -1 },
  ];
  return (
    <AbsoluteFill style={{ filter: 'blur(18px)' }}>
      {blobs.map((b, i) => {
        const { rgb, a, period, dir, ...pos } = b;
        const p = (t / period) * Math.PI * 2 * dir;
        const x = 11 * Math.sin(p);
        const y = -9 * Math.cos(p);
        const sc = 1 + 0.13 * Math.sin(p + i);
        return (
          <div key={i} style={{
            position: 'absolute', width: '62%', aspectRatio: '1',
            borderRadius: '50%', background: `rgba(${rgb},${a})`,
            transform: `translate(${x}%, ${y}%) scale(${sc})`,
            ...pos,
          }} />
        );
      })}
    </AbsoluteFill>
  );
};

/**
 * Camera lens iris: N dark blades framing a glowing aperture that slowly
 * opens and closes on a cycle — the "variable aperture" motif. Blade
 * geometry is derived from `t`, so it stays deterministic across frames.
 */
const Aperture: React.FC<{ t: number }> = ({ t }) => {
  const N = 9;
  const R = 100;                            // outer blade radius (viewBox units)
  const open = 0.5 + 0.5 * Math.sin(t * 0.65); // 0..1 aperture position
  const r = 18 + 66 * open;                 // central opening radius 18..84
  const a0 = t * 7;                         // slow blade spin (deg)
  const span = 360 / N;
  const deg = (d: number) => (d * Math.PI) / 180;
  const pt = (rad: number, a: number) =>
    `${(rad * Math.cos(deg(a))).toFixed(1)} ${(rad * Math.sin(deg(a))).toFixed(1)}`;

  // One iris blade: outer arc, then two sides tapering to the aperture tip.
  const bladeD = (i: number) => {
    const a1 = a0 + i * span;
    const a2 = a1 + span * 0.94;
    const tipIn = span * 0.32;
    const tip = r + (R - r) * 0.06;
    return `M ${pt(R, a1)} L ${pt(R, a2)} L ${pt(tip, a2 - tipIn)} L ${pt(tip, a1 + tipIn)} Z`;
  };

  return (
    <AbsoluteFill style={{ display: 'grid', placeItems: 'center', filter: 'blur(6px)' }}>
      <div style={{
        width: '150%', aspectRatio: '1', position: 'relative',
        display: 'grid', placeItems: 'center',
      }}>
        {/* Lens glow behind the blades — the aperture reveals it. */}
        <div style={{
          width: '100%', aspectRatio: '1', borderRadius: '50%',
          background: `radial-gradient(circle at 50% 50%,` +
            `rgba(255,255,255,0.95) 0%, rgba(${BLUE},0.9) 14%,` +
            `rgba(${ORANGE},0.55) 34%, rgba(255,255,255,0) 62%)`,
        }} />
        {/* Diaphragm blades (dark) framing the aperture. */}
        <svg viewBox="-120 -120 240 240" width="100%" height="100%" style={{ position: 'absolute' }}>
          {Array.from({ length: N }, (_, i) => (
            <path key={i} d={bladeD(i)} fill="rgba(6,9,16,0.94)"
              stroke={`rgba(${BLUE},0.6)`} strokeWidth={1.4} />
          ))}
        </svg>
        {/* Aperture opening outline / bright rim. */}
        <div style={{
          width: `${(r / R) * 100}%`, aspectRatio: '1', borderRadius: '50%',
          boxShadow: `0 0 22px 6px rgba(${ORANGE},0.8)`,
          background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.9) 0%, rgba(${BLUE},0.7) 40%, rgba(255,255,255,0) 70%)`,
        }} />
      </div>
    </AbsoluteFill>
  );
};

export const Background: React.FC<{ kind: BackgroundKind; bg: string }> = ({ kind, bg }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  switch (kind) {
    case 'orb': return <Orb t={t} />;
    case 'halo': return <Halo t={t} bg={bg} />;
    case 'wave': return <Wave t={t} />;
    case 'mesh': return <Mesh t={t} />;
    case 'aperture': return <Aperture t={t} />;
    case 'aurora':
    default: return <Aurora t={t} />;
  }
};
