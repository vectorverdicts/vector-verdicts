import React from 'react';
import {
  AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig,
  interpolate, spring, delayRender, continueRender,
} from 'remotion';
import { Frame } from '../brand/Frame';
import { colors, type as t, space, glow } from '../brand/tokens';
import { monoFamily } from '../brand/fonts';
import { Logo } from '../brand/Logo';
import type { Scene } from '../VideoRoot';

/**
 * Cinematic scene types for ep003 — terminal code, ADFGVX grid, map zoom,
 * and glitch outro. All values are deterministic functions of the current
 * frame (no Math.random), so parallel workers render identical frames.
 */

/* ------------------------------------------------------------------ */
/* Terminal — green/amber code scrolling on a dark screen, with an     */
/* optional highlighted line and an optional big title overlay.        */
/* ------------------------------------------------------------------ */

const TERMINAL_LINES = [
  '> decode --cipher adfgvx --key ?',
  '> loading keyring: 1918_ww1_german_military.keys',
  '> 214 keys loaded',
  '> trying key[001] ... fail',
  '> trying key[002] ... fail',
  '> trying key[003] ... fail',
  '> trying key[004] ... fail',
  '> trying key[005] ... fail',
  '> trying key[006] ... fail',
  '> trying key[007] ... fail',
  '> trying key[008] ... fail',
  '> trying key[009] ... fail',
  '> trying key[010] ... fail',
  '> trying key[011] ... fail',
  '> trying key[012] ... fail',
  '> trying key[013] ... fail',
  '> trying key[014] ... fail',
  '> trying key[015] ... fail',
  '> trying key[016] ... fail',
  '> trying key[017] ... fail',
  '> trying key[018] ... fail',
  '> trying key[019] ... fail',
  '> trying key[020] ... fail',
  '> trying key[021] ... fail',
  '> trying key[022] ... fail',
  '> trying key[023] ... fail',
  '> trying key[024] ... fail',
  '> trying key[025] ... fail',
  '> trying key[026] ... fail',
  '> trying key[027] ... fail',
  '> trying key[028] ... fail',
  '> trying key[029] ... fail',
  '> trying key[030] ... fail',
  '> trying key[031] ... fail',
  '> trying key[032] ... fail',
  '> trying key[033] ... fail',
  '> trying key[034] ... fail',
  '> trying key[035] ... fail',
  '> trying key[036] ... fail',
  '> trying key[037] ... fail',
  '> trying key[038] ... fail',
  '> trying key[039] ... fail',
  '> trying key[040] ... fail',
  '> trying key[041] ... fail',
  '> trying key[042] ... fail',
  '> trying key[043] ... fail',
  '> trying key[044] ... fail',
  '> trying key[045] ... fail',
  '> trying key[046] ... fail',
  '> trying key[047] ... fail',
  '> trying key[048] ... fail',
  '> trying key[049] ... fail',
  '> trying key[050] ... fail',
  '> trying key[051] ... fail',
  '> trying key[052] ... fail',
  '> trying key[053] ... fail',
  '> trying key[054] ... fail',
  '> trying key[055] ... fail',
  '> trying key[056] ... fail',
  '> trying key[057] ... fail',
  '> trying key[058] ... fail',
  '> trying key[059] ... fail',
  '> trying key[060] ... fail',
  '> trying key[061] ... fail',
  '> trying key[062] ... fail',
  '> trying key[063] ... fail',
  '> trying key[064] ... fail',
  '> trying key[065] ... fail',
  '> trying key[066] ... fail',
  '> trying key[067] ... fail',
  '> trying key[068] ... fail',
  '> trying key[069] ... fail',
  '> trying key[070] ... fail',
  '> trying key[071] ... fail',
  '> trying key[072] ... fail',
  '> trying key[073] ... fail',
  '> trying key[074] ... fail',
  '> trying key[075] ... fail',
  '> trying key[076] ... fail',
  '> trying key[077] ... fail',
  '> trying key[078] ... fail',
  '> trying key[079] ... fail',
  '> trying key[080] ... fail',
  '> trying key[081] ... fail',
  '> trying key[082] ... fail',
  '> trying key[083] ... fail',
  '> trying key[084] ... fail',
  '> trying key[085] ... fail',
  '> trying key[086] ... fail',
  '> trying key[087] ... fail',
  '> trying key[088] ... fail',
  '> trying key[089] ... fail',
  '> trying key[090] ... fail',
  '> trying key[091] ... fail',
  '> trying key[092] ... fail',
  '> trying key[093] ... fail',
  '> trying key[094] ... fail',
  '> trying key[095] ... fail',
  '> trying key[096] ... fail',
  '> trying key[097] ... fail',
  '> trying key[098] ... fail',
  '> trying key[099] ... fail',
  '> trying key[100] ... fail',
  '> trying key[101] ... fail',
  '> trying key[102] ... fail',
  '> trying key[103] ... fail',
  '> trying key[104] ... fail',
  '> trying key[105] ... fail',
  '> trying key[106] ... fail',
  '> trying key[107] ... fail',
  '> trying key[108] ... fail',
  '> trying key[109] ... fail',
  '> trying key[110] ... fail',
  '> trying key[111] ... fail',
  '> trying key[112] ... fail',
  '> trying key[113] ... fail',
  '> trying key[114] ... fail',
  '> trying key[115] ... fail',
  '> trying key[116] ... fail',
  '> trying key[117] ... fail',
  '> trying key[118] ... fail',
  '> trying key[119] ... fail',
  '> trying key[120] ... fail',
  '> trying key[121] ... fail',
  '> trying key[122] ... fail',
  '> trying key[123] ... fail',
  '> trying key[124] ... fail',
  '> trying key[125] ... fail',
  '> trying key[126] ... fail',
  '> trying key[127] ... fail',
  '> trying key[128] ... fail',
  '> trying key[129] ... fail',
  '> trying key[130] ... fail',
  '> trying key[131] ... fail',
  '> trying key[132] ... fail',
  '> trying key[133] ... fail',
  '> trying key[134] ... fail',
  '> trying key[135] ... fail',
  '> trying key[136] ... fail',
  '> trying key[137] ... fail',
  '> trying key[138] ... fail',
  '> trying key[139] ... fail',
  '> trying key[140] ... fail',
  '> trying key[141] ... fail',
  '> trying key[142] ... fail',
  '> trying key[143] ... fail',
  '> trying key[144] ... fail',
  '> trying key[145] ... fail',
  '> trying key[146] ... fail',
  '> trying key[147] ... fail',
  '> trying key[148] ... fail',
  '> trying key[149] ... fail',
  '> trying key[150] ... fail',
  '> trying key[151] ... fail',
  '> trying key[152] ... fail',
  '> trying key[153] ... fail',
  '> trying key[154] ... fail',
  '> trying key[155] ... fail',
  '> trying key[156] ... fail',
  '> trying key[157] ... fail',
  '> trying key[158] ... fail',
  '> trying key[159] ... fail',
  '> trying key[160] ... fail',
  '> trying key[161] ... fail',
  '> trying key[162] ... fail',
  '> trying key[163] ... fail',
  '> trying key[164] ... fail',
  '> trying key[165] ... fail',
  '> trying key[166] ... fail',
  '> trying key[167] ... fail',
  '> trying key[168] ... fail',
  '> trying key[169] ... fail',
  '> trying key[170] ... fail',
  '> trying key[171] ... fail',
  '> trying key[172] ... fail',
  '> trying key[173] ... fail',
  '> trying key[174] ... fail',
  '> trying key[175] ... fail',
  '> trying key[176] ... fail',
  '> trying key[177] ... fail',
  '> trying key[178] ... fail',
  '> trying key[179] ... fail',
  '> trying key[180] ... fail',
  '> trying key[181] ... fail',
  '> trying key[182] ... fail',
  '> trying key[183] ... fail',
  '> trying key[184] ... fail',
  '> trying key[185] ... fail',
  '> trying key[186] ... fail',
  '> trying key[187] ... fail',
  '> trying key[188] ... fail',
  '> trying key[189] ... fail',
  '> trying key[190] ... fail',
  '> trying key[191] ... fail',
  '> trying key[192] ... fail',
  '> trying key[193] ... fail',
  '> trying key[194] ... fail',
  '> trying key[195] ... fail',
  '> trying key[196] ... fail',
  '> trying key[197] ... fail',
  '> trying key[198] ... fail',
  '> trying key[199] ... fail',
  '> trying key[200] ... fail',
  '> trying key[201] ... fail',
  '> trying key[202] ... fail',
  '> trying key[203] ... fail',
  '> trying key[204] ... fail',
  '> trying key[205] ... fail',
  '> trying key[206] ... fail',
  '> trying key[207] ... fail',
  '> trying key[208] ... fail',
  '> trying key[209] ... fail',
  '> trying key[210] ... fail',
  '> trying key[211] ... fail',
  '> trying key[212] ... fail',
  '> trying key[213] ... fail',
  '> trying key[214] ... fail',
  '> MATCH: TRUPPENBEWEGUNG',
];

const TerminalScene: React.FC<{ s: Extract<Scene, { kind: 'terminal' }> }> = ({ s }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // Scroll: reveal ~2.2 lines/sec, keep a window of ~14 lines visible.
  const scroll = Math.floor(t * 2.2);
  const start = Math.max(0, scroll - 12);
  const visible = TERMINAL_LINES.slice(start, start + 14);

  const accent = s.accent === 'amber' ? '#FFB020' : '#3DFF8A';
  const dim = s.accent === 'amber' ? 'rgba(255,176,32,0.35)' : 'rgba(61,255,138,0.35)';

  return (
    <Frame padded={false} backgroundKind="halo">
      <AbsoluteFill style={{ backgroundColor: 'rgba(6,9,16,0.92)' }}>
        {/* Terminal window */}
        <div style={{
          position: 'absolute', left: '6%', right: '6%', top: '16%', bottom: '18%',
          borderRadius: 16, overflow: 'hidden',
          background: 'rgba(4,8,14,0.96)',
          border: `1px solid ${accent}55`,
          boxShadow: `0 0 40px ${accent}22, inset 0 0 60px rgba(0,0,0,0.6)`,
        }}>
          {/* Title bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '14px 18px', borderBottom: `1px solid ${accent}33`,
            background: 'rgba(10,16,26,0.9)',
          }}>
            <span style={{ width: 12, height: 12, borderRadius: 6, background: '#FF5F57' }} />
            <span style={{ width: 12, height: 12, borderRadius: 6, background: '#FEBC2E' }} />
            <span style={{ width: 12, height: 12, borderRadius: 6, background: '#28C840' }} />
            <span style={{
              fontFamily: monoFamily, fontSize: 20, color: dim, marginLeft: 12,
              letterSpacing: '0.08em',
            }}>decode — adfgvx_breaker.sh</span>
          </div>
          {/* Code body */}
          <div style={{
            padding: '18px 22px', fontFamily: monoFamily, fontSize: 26, lineHeight: 1.5,
            color: accent, textShadow: `0 0 8px ${accent}66`,
          }}>
            {visible.map((line, i) => {
              const isMatch = line.includes('MATCH');
              return (
                <div key={start + i} style={{
                  color: isMatch ? '#FFFFFF' : accent,
                  background: isMatch ? `${accent}22` : 'transparent',
                  fontWeight: isMatch ? 700 : 400,
                  textShadow: isMatch ? `0 0 12px ${accent}` : `0 0 8px ${accent}55`,
                  whiteSpace: 'nowrap',
                }}>
                  {line}
                </div>
              );
            })}
            {/* blinking cursor */}
            <span style={{
              display: 'inline-block', width: 12, height: 26, background: accent,
              opacity: Math.floor(t * 2) % 2 === 0 ? 1 : 0.2,
              marginTop: 4,
            }} />
          </div>
        </div>

        {/* Big title overlay */}
        {s.title ? (
          <div style={{
            position: 'absolute', left: 0, right: 0, top: '6%',
            display: 'flex', justifyContent: 'center',
          }}>
            <div style={{
              fontFamily: monoFamily, fontSize: 64, fontWeight: 700,
              color: '#FFFFFF', letterSpacing: '0.06em',
              textShadow: `0 0 24px ${accent}, 0 4px 30px rgba(0,0,0,0.9)`,
              background: 'rgba(6,9,16,0.55)', padding: '10px 34px', borderRadius: 12,
              border: `1px solid ${accent}44`,
            }}>{s.title}</div>
          </div>
        ) : null}
      </AbsoluteFill>
    </Frame>
  );
};

/* ------------------------------------------------------------------ */
/* ADFGVX grid — authentic 6x6 transposition grid with blinking coords. */
/* ------------------------------------------------------------------ */

const GRID = [
  ['H','O','U','S','E','A'],
  ['B','C','D','F','G','I'],
  ['J','K','L','M','N','P'],
  ['Q','R','T','V','W','X'],
  ['Y','Z','0','1','2','3'],
  ['4','5','6','7','8','9'],
];
const AXES = ['A','D','F','G','V','X'];

const GridScene: React.FC<{ s: Extract<Scene, { kind: 'grid' }> }> = ({ s }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;

  // Blink a coordinate pair: cycles through the 36 cells.
  const cell = Math.floor(sec * 3) % 36;
  const blinkR = Math.floor(cell / 6);
  const blinkC = cell % 6;

  return (
    <Frame backgroundKind="wave">
      {s.heading ? (
        <div style={{
          fontFamily: monoFamily, fontSize: t.label, letterSpacing: t.tracking.label,
          color: colors.accentBlue, textTransform: 'uppercase', marginBottom: space.lg,
          textAlign: 'center',
        }}>{s.heading}</div>
      ) : null}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{
          border: `1px solid ${colors.accentBlue}66`, borderRadius: 12, overflow: 'hidden',
          boxShadow: glow(colors.accentBlue, 0.3),
        }}>
          {/* header row */}
          <div style={{ display: 'flex' }}>
            <div style={{ width: 64, height: 64 }} />
            {AXES.map((a) => (
              <div key={a} style={{
                width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: monoFamily, fontSize: 30, fontWeight: 700, color: colors.accentOrange,
                borderBottom: `1px solid ${colors.accentBlue}44`, borderLeft: `1px solid ${colors.accentBlue}22`,
              }}>{a}</div>
            ))}
          </div>
          {GRID.map((row, r) => (
            <div key={r} style={{ display: 'flex' }}>
              <div style={{
                width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: monoFamily, fontSize: 30, fontWeight: 700, color: colors.accentOrange,
                borderRight: `1px solid ${colors.accentBlue}44`, borderTop: `1px solid ${colors.accentBlue}22`,
              }}>{AXES[r]}</div>
              {row.map((ch, c) => {
                const isBlink = r === blinkR && c === blinkC;
                return (
                  <div key={c} style={{
                    width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: monoFamily, fontSize: 30, color: colors.white,
                    borderTop: `1px solid ${colors.accentBlue}22`, borderLeft: `1px solid ${colors.accentBlue}22`,
                    background: isBlink ? `${colors.accentBlue}33` : 'transparent',
                    textShadow: isBlink ? glow(colors.accentBlue, 0.6) : 'none',
                  }}>{ch}</div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {/* coordinate readout */}
      <div style={{
        fontFamily: monoFamily, fontSize: 30, color: colors.accentBlue, marginTop: space.lg,
        textAlign: 'center', textShadow: glow(colors.accentBlue, 0.4),
      }}>
        {AXES[blinkR]}{AXES[blinkC]} → {GRID[blinkR][blinkC]}
      </div>
    </Frame>
  );
};

/* ------------------------------------------------------------------ */
/* Map zoom — image that zooms into a target point with a pulsing pin. */
/* ------------------------------------------------------------------ */

const MapZoomScene: React.FC<{ s: Extract<Scene, { kind: 'mapzoom' }> }> = ({ s }) => {
  const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const dur = Math.max(1, Math.round(s.seconds * fps));
    const t = frame / fps;
    const [handle] = React.useState(() => delayRender('loading map image'));
  const done = React.useCallback(() => continueRender(handle), [handle]);

  // Zoom from 1.0 -> 2.2, drifting toward the target point.
  const zoom = interpolate(frame, [0, dur], [1.0, 2.2], { extrapolateRight: 'clamp' });
  const tx = s.targetX ?? 50;
  const ty = s.targetY ?? 50;
  // translate so the target stays centered as we zoom
  const translateX = interpolate(frame, [0, dur], [0, (50 - tx) * 2], { extrapolateRight: 'clamp' });
  const translateY = interpolate(frame, [0, dur], [0, (50 - ty) * 2], { extrapolateRight: 'clamp' });

  // pulsing pin
  const pulse = 0.5 + 0.5 * Math.sin(t * 4);
  const pinScale = 1 + 0.25 * pulse;

  return (
    <Frame padded={false}>
      <AbsoluteFill style={{ overflow: 'hidden' }}>
        <Img
          src={staticFile(s.src)}
          onLoad={done}
          onError={done}
          style={{
            position: 'absolute', width: '100%', height: '100%', objectFit: 'cover',
            transform: `scale(${zoom}) translate(${translateX}%, ${translateY}%)`,
            transformOrigin: `${tx}% ${ty}%`,
          }}
        />
        {/* dim */}
        <AbsoluteFill style={{ backgroundColor: 'rgba(6,9,16,0.30)' }} />
        {/* pulsing pin */}
        <div style={{
          position: 'absolute', left: `${tx}%`, top: `${ty}%`,
          transform: `translate(-50%,-50%) scale(${pinScale})`,
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%', background: colors.accentOrange,
            boxShadow: `0 0 0 8px ${colors.accentOrange}33, 0 0 30px ${colors.accentOrange}`,
          }} />
        </div>
        {/* caption */}
        {s.caption ? (
          <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', padding: space.xl }}>
            <div style={{
              fontFamily: monoFamily, fontSize: 34, color: '#FFFFFF', textAlign: 'center',
              background: 'rgba(6,9,16,0.7)', padding: '12px 28px', borderRadius: 12,
              border: `1px solid ${colors.accentBlue}55`, textShadow: glow(colors.accentBlue, 0.4),
            }}>{s.caption}</div>
          </AbsoluteFill>
        ) : null}
      </AbsoluteFill>
    </Frame>
  );
};

/* ------------------------------------------------------------------ */
/* Glitch outro — RGB-split glitch, then the logo slams in.            */
/* ------------------------------------------------------------------ */

const GlitchOutroScene: React.FC<{ s: Extract<Scene, { kind: 'glitch' }> }> = ({ s }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Glitch for the first ~40% of the scene, then settle into the logo.
  const glitchEnd = Math.round(s.seconds * fps * 0.4);
  const glitching = frame < glitchEnd;
  const glitchAmt = glitching ? Math.max(0, 1 - frame / glitchEnd) : 0;

  // deterministic pseudo-random offsets from frame
  const off1 = Math.sin(frame * 1.7) * 18 * glitchAmt;
  const off2 = Math.cos(frame * 2.3) * 14 * glitchAmt;
  const sliceY = (Math.sin(frame * 3.1) * 0.5 + 0.5) * 100;

  const pop = spring({ frame: frame - glitchEnd, fps, config: { damping: 12, mass: 0.8 } });
  const scale = interpolate(pop, [0, 1], [0.7, 1], { extrapolateRight: 'clamp' });

  return (
    <Frame backdrop backdropOpacity={0.4} backgroundKind="orb">
      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {/* glitch slices */}
        {glitching ? (
          <AbsoluteFill style={{ pointerEvents: 'none' }}>
            <div style={{
              position: 'absolute', left: 0, right: 0, top: `${sliceY}%`, height: '6%',
              background: `linear-gradient(90deg, ${colors.accentBlue}, ${colors.accentOrange})`,
              opacity: glitchAmt * 0.5, transform: `translateX(${off1}px)`,
            }} />
            <div style={{
              position: 'absolute', left: 0, right: 0, top: `${(sliceY + 20) % 100}%`, height: '3%',
              background: colors.accentBlue, opacity: glitchAmt * 0.4, transform: `translateX(${off2}px)`,
            }} />
          </AbsoluteFill>
        ) : null}
        <div style={{ transform: `scale(${scale})`, opacity: interpolate(pop, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' }) }}>
          <Logo scale={0.5} variant="mark" />
        </div>
        <div style={{
          height: 4, width: 140, marginTop: space.md,
          background: `linear-gradient(90deg, ${colors.accentBlue}, ${colors.accentOrange})`,
          boxShadow: glow(colors.accentBlue, 0.4),
        }} />
        {s.message ? (
          <div style={{
            fontFamily: monoFamily, fontSize: 44, color: colors.textMuted, marginTop: space.md,
            letterSpacing: '0.1em', textAlign: 'center',
          }}>{s.message}</div>
        ) : null}
      </AbsoluteFill>
    </Frame>
  );
};

export const CinematicScenes: React.FC<{ scene: Scene }> = ({ scene }) => {
  switch (scene.kind) {
    case 'terminal': return <TerminalScene s={scene} />;
    case 'grid': return <GridScene s={scene} />;
    case 'mapzoom': return <MapZoomScene s={scene} />;
    case 'glitch': return <GlitchOutroScene s={scene} />;
    default: return null;
  }
};
