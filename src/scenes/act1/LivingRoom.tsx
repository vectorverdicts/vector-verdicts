import React from 'react';
import { AbsoluteFill } from 'remotion';
import { colors } from '../../brand/tokens';

/**
 * Act 1 living-room set — the room an LG TV sits in while it listens.
 *
 * ARCHITECTURE: this is deliberately NOT a member of VideoRoot's
 * `sceneSchema` discriminated union. There is no episode-authored JSON
 * shape backing it — every value here is hand-placed staging (parallax
 * factors, furniture layout, light sources) driven by camera/lighting
 * props, not by content a producer fills in per episode. It's choreography,
 * not data, so it's composed directly by whatever act1 component needs it
 * rather than routed through `Scene`/`SceneRenderer`.
 *
 * The TV itself is a separate component — this set only leaves room for it
 * (the TV stand) and casts the glow it would throw.
 */

export interface LivingRoomProps {
  /** Camera dolly, in px. Negative moves the camera right. */
  dollyX?: number;
  /** Cold spill thrown by the (separately-drawn) TV screen, 0-1. */
  tvGlow?: number;
  /** Warm output of the floor lamp, the act's only warm source, 0-1. */
  lampWarmth?: number;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * Scene-local palette — furniture and wall tones, not brand colors.
 * Desaturated blue-greys pitched to sit quietly under colors.bg (#060910)
 * rather than compete with accentBlue/accentOrange for attention. The lamp's
 * warm tones are the deliberate exception: they're the one warm light
 * source in the act, everything else stays in the cold family.
 */
const room = {
  wall: '#232c3a',
  wallShadow: '#1b2330',
  wainscot: '#1c2430',
  molding: '#2d3648',
  floor: '#1a2029',
  floorboard: '#12171f',
  rug: '#202a3b',
  rugBorder: '#2d3a52',
  windowFrame: '#131923',
  windowGlass: '#0c1119',
  blind: '#2a3243',
  moon: '#cdd7e2',
  frame: '#324056',
  pictureFill: '#151b24',
  bookshelfWood: '#1f2630',
  spine: '#2b3446',
  sofa: '#242c3a',
  sofaLit: '#2e3748',
  cushion: '#2a3244',
  sofaArm: '#1d2430',
  sofaFoot: '#11151b',
  tableWood: '#25303f',
  mug: '#3a4356',
  remote: '#12161c',
  tvStand: '#1b222c',
  lampPole: '#2a323f',
  lampShade: '#3b4359',
  lampBase: '#1f2630',
  lampWarm: '#ffd8a6',
  lampWarmCore: '#ffefd1',
  plantPot: '#2a3242',
  plantLeaf: '#27394a',
  plantLeafLight: '#33485c',
  plantLeafDark: '#1d2b36',
} as const;

// ---- lamp light mixed into the furniture it actually falls on ----
// A radial gradient overlay reads as light pasted on top of a shape; this
// instead interpolates the SHAPE'S OWN fill toward the lamp's tone, based on
// distance from the lamp, so the object itself looks lit.
const LAMP_X = 1400;
const WARM_REACH = 500;
const MAX_WARM_MIX = 0.22;

const hexToRgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const toHex2 = (v: number) => v.toString(16).padStart(2, '0');
const mixHex = (from: string, to: string, t: number) => {
  const [fr, fg, fb] = hexToRgb(from);
  const [tr, tg, tb] = hexToRgb(to);
  const lerp = (a: number, b: number) => Math.round(a + (b - a) * t);
  return `#${toHex2(lerp(fr, tr))}${toHex2(lerp(fg, tg))}${toHex2(lerp(fb, tb))}`;
};
/** How lamp-lit a point at world-x `x` should read, before the base mix cap. */
const warmAt = (x: number, warmth: number) =>
  clamp01(1 - Math.abs(x - LAMP_X) / WARM_REACH) * warmth * MAX_WARM_MIX;
const litFill = (base: string, x: number, warmth: number) => mixHex(base, room.lampWarm, warmAt(x, warmth));

// ---- sofa geometry — scaled ~1.5x, right of centre, y 380-700 ----
const SOFA_X = 1180;
const SOFA_W = 680;
const ARM_W = 66;
const CUSHION_AREA_X = SOFA_X + ARM_W;
const CUSHION_AREA_W = SOFA_W - ARM_W * 2;
const CUSHION_W = CUSHION_AREA_W / 3;
const cushionX = (i: number) => CUSHION_AREA_X + i * CUSHION_W + CUSHION_W * 0.05;
const cushionCenterX = (i: number) => CUSHION_AREA_X + i * CUSHION_W + CUSHION_W * 0.5;
const cushionW = CUSHION_W * 0.9;

// ---- foreground plant — six broad, overlapping, hand-placed leaves ----
const leafPath = (length: number, width: number) =>
  `M135 940 C ${135 - width} ${940 - length * 0.55}, ${135 - width * 0.25} ${940 - length}, 135 ${940 - length} ` +
  `C ${135 + width * 0.25} ${940 - length}, ${135 + width} ${940 - length * 0.55}, 135 940 Z`;

const LEAVES = [
  { rotate: -62, length: 150, width: 30, shade: room.plantLeafDark },
  { rotate: -36, length: 195, width: 40, shade: room.plantLeaf },
  { rotate: -12, length: 225, width: 46, shade: room.plantLeafLight },
  { rotate: 12, length: 220, width: 45, shade: room.plantLeaf },
  { rotate: 36, length: 190, width: 38, shade: room.plantLeafDark },
  { rotate: 60, length: 145, width: 28, shade: room.plantLeaf },
] as const;

export const LivingRoom: React.FC<LivingRoomProps> = ({
  dollyX = 0,
  tvGlow = 0.6,
  lampWarmth = 0.8,
}) => {
  const glow = clamp01(tvGlow);
  const warmth = clamp01(lampWarmth);

  // Parallax: farther layers move less, closer layers move more, all as a
  // direct function of dollyX so parallel render workers agree on frames.
  const back = dollyX * 0.28;
  const mid = dollyX * 1.0;
  const fore = dollyX * 1.9;

  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1920 1080" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="lampWallGlow">
            <stop offset="0%" stopColor={room.lampWarmCore} stopOpacity="0.85" />
            <stop offset="100%" stopColor={room.lampWarmCore} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="lampFloorGlow">
            <stop offset="0%" stopColor={room.lampWarm} stopOpacity="0.8" />
            <stop offset="100%" stopColor={room.lampWarm} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="tvSpillGlow">
            <stop offset="0%" stopColor={colors.accentBlue} stopOpacity="0.55" />
            <stop offset="100%" stopColor={colors.accentBlue} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ceilingFalloff" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.bg} stopOpacity="0.7" />
            <stop offset="22%" stopColor={colors.bg} stopOpacity="0" />
            <stop offset="100%" stopColor={colors.bg} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* ---------------- back layer — 0.28x dolly ---------------- */}
        <g transform={`translate(${back} 0)`}>
          {/* wall */}
          <rect x={-200} y={0} width={2320} height={620} fill={room.wall} />
          {/* crown molding */}
          <rect x={-200} y={0} width={2320} height={22} fill={room.molding} />
          <rect x={-200} y={22} width={2320} height={6} fill={room.wallShadow} />
          {/* wainscot panelling — raised to eye level for the closer camera */}
          <rect x={-200} y={300} width={2320} height={320} fill={room.wainscot} />
          <rect x={-200} y={300} width={2320} height={8} fill={room.molding} />
          {Array.from({ length: 14 }, (_, i) => (
            <rect key={`wainscot-${i}`} x={-160 + i * 160} y={320} width={4} height={280} fill={room.wallShadow} />
          ))}

          {/* night window with blinds and a moon — clear of the lamp's wash */}
          <g>
            <rect x={850} y={100} width={300} height={320} fill={room.windowFrame} />
            <rect x={870} y={120} width={260} height={280} fill={room.windowGlass} />
            <circle cx={1040} cy={162} r={34} fill={room.moon} opacity={0.9} />
            {Array.from({ length: 7 }, (_, i) => (
              <rect key={`blind-${i}`} x={870} y={125 + i * 38} width={260} height={8} fill={room.blind} opacity={0.85} />
            ))}
            <rect x={870} y={120} width={2} height={280} fill={room.windowFrame} />
            <rect x={998} y={120} width={4} height={280} fill={room.windowFrame} />
            <rect x={1128} y={120} width={2} height={280} fill={room.windowFrame} />
          </g>

          {/* two framed pictures */}
          {[{ x: 420, y: 120, w: 140, h: 140 }, { x: 650, y: 150, w: 140, h: 120 }].map((p, i) => (
            <g key={`frame-${i}`}>
              <rect x={p.x} y={p.y} width={p.w} height={p.h} fill={room.frame} />
              <rect x={p.x + 10} y={p.y + 10} width={p.w - 20} height={p.h - 20} fill={room.pictureFill} />
            </g>
          ))}

          {/* bookshelf with visible spines, floor-to-molding-line */}
          <g>
            <rect x={40} y={300} width={300} height={320} fill={room.bookshelfWood} />
            {[379, 457, 536].map((y, i) => (
              <rect key={`shelf-${i}`} x={40} y={y} width={300} height={8} fill={room.wallShadow} />
            ))}
            {[379, 457, 536].map((shelfY, row) =>
              Array.from({ length: 12 }, (_, i) => {
                const w = 14 + ((i * 7 + row * 3) % 10);
                const h = 40 + ((i * 5 + row * 11) % 35);
                return (
                  <rect
                    key={`spine-${row}-${i}`}
                    x={56 + i * 24}
                    y={shelfY - h}
                    width={w}
                    height={h}
                    fill={room.spine}
                  />
                );
              }),
            )}
          </g>

          {/* the lamp's wash on the wall, above the sofa back, clear of the window */}
          <ellipse
            cx={LAMP_X} cy={250} rx={200} ry={190}
            fill="url(#lampWallGlow)" opacity={warmth}
            style={{ mixBlendMode: 'screen' }}
          />
        </g>

        {/* ---------------- mid layer — 1.0x dolly ---------------- */}
        <g transform={`translate(${mid} 0)`}>
          {/* floor */}
          <rect x={-200} y={620} width={2320} height={460} fill={room.floor} />
          {Array.from({ length: 22 }, (_, i) => (
            <rect key={`board-${i}`} x={-200} y={620 + i * 21} width={2320} height={2} fill={room.floorboard} opacity={0.6} />
          ))}

          {/* oval rug with border — kept clear of the TV stand */}
          <ellipse cx={1250} cy={890} rx={420} ry={120} fill={room.rug} />
          <ellipse cx={1250} cy={890} rx={420} ry={120} fill="none" stroke={room.rugBorder} strokeWidth={6} />

          {/* cold TV spill, thrown from the TV stand across the rug */}
          <ellipse
            cx={650} cy={890} rx={380} ry={130}
            fill="url(#tvSpillGlow)" opacity={glow}
            style={{ mixBlendMode: 'screen' }}
          />

          {/* TV stand — raised and set back against the wall, off the rug.
              Top edge at y=560 puts a TV's screen centre near y=430, eye
              level for someone seated on the sofa. The TV itself is a
              separate component. */}
          <g>
            <rect x={303} y={560} width={495} height={135} fill={room.tvStand} />
            <rect x={303} y={695} width={495} height={10} fill={room.wallShadow} />
            <rect x={339} y={705} width={30} height={45} fill={room.wallShadow} />
            <rect x={732} y={705} width={30} height={45} fill={room.wallShadow} />
          </g>

          {/* coffee table — its lamp-facing (right) edge reads warmer */}
          <g>
            <rect x={760} y={800} width={390} height={26} fill={room.tableWood} />
            <rect x={1130} y={800} width={20} height={26} fill={mixHex(room.tableWood, room.lampWarm, warmth * 0.18)} />
            <rect x={785} y={826} width={18} height={54} fill={room.tableWood} />
            <rect x={1105} y={826} width={18} height={54} fill={mixHex(room.tableWood, room.lampWarm, warmth * 0.14)} />
            <rect x={830} y={772} width={34} height={28} rx={4} fill={room.mug} />
            <path d="M864 778 q16 0 16 12 t-16 12" fill="none" stroke={room.mug} strokeWidth={5} />
            <rect x={1000} y={780} width={80} height={20} rx={4} fill={room.remote} />
          </g>

          {/* the lamp's pool of light, peeking out at the sofa's base */}
          <ellipse
            cx={LAMP_X} cy={700} rx={170} ry={55}
            fill="url(#lampFloorGlow)" opacity={warmth}
            style={{ mixBlendMode: 'screen' }}
          />

          {/* floor lamp — shade pokes up above the sofa back; the pole and
              base are drawn but sit behind the sofa, which is painted after
              this group and occludes them. */}
          <g>
            <rect x={LAMP_X - 6} y={340} width={12} height={320} fill={room.lampPole} />
            <path d="M1320 260 L1480 260 L1450 340 L1350 340 Z" fill={room.lampShade} />
            <ellipse cx={LAMP_X} cy={658} rx={46} ry={14} fill={room.lampBase} />
          </g>

          {/* three-seat sofa — scaled up, right of centre. Back cushion 0 and
              the left arm sit nearest the lamp and read visibly warmer than
              their counterparts on the far (right) side — the fills below
              are the base tones interpolated toward the lamp's tone by
              distance, not an overlay sitting on top of the shapes. */}
          <g>
            <rect x={SOFA_X} y={380} width={SOFA_W} height={170} rx={27} fill={room.sofa} />
            {[0, 1, 2].map((i) => (
              <rect
                key={`back-cush-${i}`}
                x={cushionX(i)} y={395} width={cushionW} height={140} rx={14}
                fill={litFill(room.sofaLit, cushionCenterX(i), warmth)}
              />
            ))}
            {[0, 1, 2].map((i) => (
              <rect
                key={`seat-cush-${i}`}
                x={cushionX(i)} y={550} width={cushionW} height={110} rx={12}
                fill={litFill(room.cushion, cushionCenterX(i), warmth)}
              />
            ))}
            <rect x={SOFA_X} y={430} width={ARM_W} height={240} rx={24} fill={litFill(room.sofaArm, SOFA_X + ARM_W / 2, warmth)} />
            <rect x={SOFA_X + SOFA_W - ARM_W} y={430} width={ARM_W} height={240} rx={24} fill={litFill(room.sofaArm, SOFA_X + SOFA_W - ARM_W / 2, warmth)} />
            <rect x={SOFA_X + 20} y={660} width={16} height={40} fill={room.sofaFoot} />
            <rect x={SOFA_X + SOFA_W - 36} y={660} width={16} height={40} fill={room.sofaFoot} />
          </g>
        </g>

        {/* ---------------- foreground layer — 1.9x dolly ---------------- */}
        <g transform={`translate(${fore} 0)`}>
          <g>
            <ellipse cx={135} cy={1050} rx={90} ry={20} fill={room.wallShadow} opacity={0.5} />
            <path d="M84 1030 L186 1030 L172 940 L98 940 Z" fill={room.plantPot} />
            {LEAVES.map((leaf, i) => (
              <path
                key={`leaf-${i}`}
                d={leafPath(leaf.length, leaf.width)}
                fill={leaf.shade}
                transform={`rotate(${leaf.rotate} 135 940)`}
              />
            ))}
          </g>
        </g>

        {/* ---------------- ceiling falloff, painted last, over everything ---------------- */}
        <rect x={0} y={0} width={1920} height={1080} fill="url(#ceilingFalloff)" />
      </svg>
    </AbsoluteFill>
  );
};
