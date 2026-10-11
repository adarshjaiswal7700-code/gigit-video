import React from 'react';
import {
  AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, spring,
  staticFile, useCurrentFrame, useVideoConfig, Easing,
} from 'remotion';
import {loadFont} from '@remotion/fonts';

const ANTON = 'AntonLocal';
const INTER = 'InterLocal';
loadFont({family: ANTON, url: staticFile('anton.woff2')});
for (const w of ['500', '700', '900']) loadFont({family: INTER, url: staticFile(`inter-${w}.woff2`), weight: w});

export const FPS = 25;
export const DURATION = 829; // 33.16s

// ---- Brand ----
const RED = '#FF1E1E';
const WHITE = '#FFFFFF';
// Change this to your Instagram handle (leave '' to hide it)
const HANDLE = '';

const s = (sec: number) => Math.round(sec * FPS);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Scene boundaries (frames). Face shown in FACE scenes, motion graphics elsewhere.
const SC = {
  face1: [0, s(2.4)],
  tension: [s(2.4), s(5.5)],
  profiles: [s(5.5), s(9.4)],
  process: [s(9.4), s(15.4)],
  services: [s(15.4), s(22.0)],
  face2: [s(22.0), s(24.5)],
  kaam: [s(24.5), s(26.2)],
  payment: [s(26.2), s(30.0)],
  face3: [s(30.0), DURATION],
} as const;
const CUTS = Object.values(SC).map(([a]) => a).filter((a) => a > 0);

const glowW = `0 0 12px rgba(255,255,255,.9), 0 0 36px rgba(255,255,255,.55), 0 0 80px rgba(255,255,255,.25)`;
const glowR = `0 2px 0 rgba(0,0,0,.9), 0 0 10px rgba(255,30,30,.9), 0 0 34px rgba(255,30,30,.6), 0 0 80px rgba(255,30,30,.35)`;

// ---------- helpers ----------
const usePop = (start: number, damping = 11) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - start, fps, config: {damping, stiffness: 180, mass: 0.6}});
};

const Glitch: React.FC<{start: number; children: React.ReactNode; style?: React.CSSProperties}> = ({start, children, style}) => {
  const f = useCurrentFrame();
  const d = f - start;
  const on = d >= 0 && d < 6;
  const off = on ? (d % 2 === 0 ? 14 : -10) : 0;
  return (
    <div style={{position: 'relative', ...style}}>
      {on && <div style={{position: 'absolute', inset: 0, transform: `translateX(${off}px)`, color: '#00E5FF', opacity: 0.7, mixBlendMode: 'screen'}}>{children}</div>}
      {on && <div style={{position: 'absolute', inset: 0, transform: `translateX(${-off}px)`, color: RED, opacity: 0.8, mixBlendMode: 'screen'}}>{children}</div>}
      <div style={{position: 'relative', clipPath: on && d % 3 === 1 ? 'inset(0 0 45% 0)' : undefined}}>{children}</div>
    </div>
  );
};

const Word: React.FC<{
  at: number; text: string; size: number; red?: boolean; font?: string; glitch?: boolean; style?: React.CSSProperties;
}> = ({at, text, size, red, font = ANTON, glitch, style}) => {
  const f = useCurrentFrame();
  const p = usePop(at);
  if (f < at) return null;
  const sc = interpolate(p, [0, 1], [1.8, 1]);
  const content = (
    <div style={{
      fontFamily: font, fontSize: size, lineHeight: 1, color: red ? RED : WHITE, letterSpacing: font === ANTON ? 2 : 0,
      WebkitTextStroke: red ? '2px rgba(255,255,255,.35)' : undefined, textShadow: red ? glowR : glowW, textTransform: 'uppercase', whiteSpace: 'nowrap', fontWeight: 900,
    }}>{text}</div>
  );
  return (
    <div style={{transform: `scale(${sc})`, opacity: Math.min(1, p * 1.6), filter: `blur(${(1 - Math.min(1, p)) * 8}px)`, ...style}}>
      {glitch ? <Glitch start={at}>{content}</Glitch> : content}
    </div>
  );
};

// ---------- background ----------
const MGBackground: React.FC = () => {
  const f = useCurrentFrame();
  const x1 = 50 + Math.sin(f / 40) * 25;
  const y1 = 35 + Math.cos(f / 55) * 15;
  const x2 = 50 + Math.cos(f / 35) * 30;
  return (
    <AbsoluteFill style={{background: '#050505'}}>
      <AbsoluteFill style={{background: `radial-gradient(circle at ${x1}% ${y1}%, rgba(255,30,30,.35), transparent 45%)`}} />
      <AbsoluteFill style={{background: `radial-gradient(circle at ${x2}% 85%, rgba(255,30,30,.22), transparent 40%)`}} />
      <AbsoluteFill style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)',
        backgroundSize: '90px 90px', backgroundPosition: `0 ${(f * 2) % 90}px`,
        maskImage: 'radial-gradient(circle at 50% 50%, black 30%, transparent 75%)',
      }} />
      {Array.from({length: 28}).map((_, i) => {
        const px = (i * 137.5) % 100;
        const py = (((i * 61.8) % 100) - f * (0.15 + (i % 5) * 0.06) + 200) % 100;
        return <div key={i} style={{position: 'absolute', left: `${px}%`, top: `${py}%`, width: 4 + (i % 3) * 2, height: 4 + (i % 3) * 2, borderRadius: 99,
          background: i % 4 === 0 ? WHITE : RED, opacity: 0.25 + (i % 4) * 0.12, boxShadow: `0 0 12px ${i % 4 === 0 ? WHITE : RED}`}} />;
      })}
      <AbsoluteFill style={{boxShadow: 'inset 0 0 300px rgba(0,0,0,.95)'}} />
    </AbsoluteFill>
  );
};

const Center: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 30, ...style}}>{children}</AbsoluteFill>
);

const Pill: React.FC<{at: number; text: string; red?: boolean}> = ({at, text, red}) => {
  const f = useCurrentFrame();
  const p = usePop(at, 13);
  if (f < at) return null;
  return (
    <div style={{
      transform: `scale(${p})`, padding: '18px 44px', borderRadius: 999, fontFamily: INTER, fontWeight: 900, fontSize: 44,
      color: red ? WHITE : '#111', background: red ? RED : WHITE, boxShadow: red ? glowR.replace(/text/g, '') : '0 0 40px rgba(255,255,255,.6)',
      letterSpacing: 2, textTransform: 'uppercase',
    }}>{text}</div>
  );
};

// ---------- scenes ----------
const SceneTension: React.FC = () => {
  const f = useCurrentFrame();
  const strike = interpolate(f, [s(4.4), s(4.7)], [0, 100], clamp);
  return (
    <Center>
      <Word at={s(2.9)} text="Aapko bilkul" size={80} font={INTER} />
      <div style={{position: 'relative'}}>
        <Word at={s(3.5)} text="TENSION" size={260} red glitch />
        <div style={{position: 'absolute', left: -20, top: '52%', height: 22, width: `calc(${strike}% + 40px)`, background: WHITE, boxShadow: glowW.replace(/text/g, ''), transform: 'rotate(-6deg)', opacity: strike > 0 ? 1 : 0}} />
      </div>
      <Word at={s(4.6)} text="lene ki zarurat nahi" size={70} font={INTER} />
    </Center>
  );
};

const Phone: React.FC<{at: number; label: string; icon: string; from: number}> = ({at, label, icon, from}) => {
  const f = useCurrentFrame();
  const p = usePop(at, 14);
  if (f < at) return null;
  const float = Math.sin((f - at) / 12) * 10;
  return (
    <div style={{transform: `translateX(${(1 - p) * from}px) translateY(${float}px) rotate(${(1 - p) * (from > 0 ? 20 : -20)}deg)`, opacity: p,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34}}>
      <div style={{width: 360, height: 680, borderRadius: 56, border: `5px solid ${RED}`, background: 'linear-gradient(180deg,#1a0a0a,#0b0b0b)',
        boxShadow: `0 0 40px rgba(255,30,30,.8), inset 0 0 40px rgba(255,30,30,.25)`, padding: 28, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 18}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
          <div style={{width: 96, height: 96, borderRadius: 99, background: `conic-gradient(${RED}, #ff9a3c, ${RED})`, display: 'grid', placeItems: 'center', fontSize: 50}}>{icon}</div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
            {[150, 110].map((w, i) => <div key={i} style={{width: w, height: 14, borderRadius: 8, background: 'rgba(255,255,255,.5)'}} />)}
          </div>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 16}}>
          {Array.from({length: 12}).map((_, i) => {
            const lit = f - at > 6 + i * 2;
            return <div key={i} style={{aspectRatio: '1', borderRadius: 8, background: lit ? (i % 3 === 1 ? RED : 'rgba(255,255,255,.75)') : 'rgba(255,255,255,.1)', boxShadow: lit && i % 3 === 1 ? '0 0 14px rgba(255,30,30,.9)' : undefined}} />;
          })}
        </div>
      </div>
      <div style={{fontFamily: ANTON, fontSize: 64, color: WHITE, textShadow: glowW, letterSpacing: 2}}>{label}</div>
    </div>
  );
};

const SceneProfiles: React.FC = () => (
  <Center style={{gap: 70}}>
    <div style={{display: 'flex', gap: 60}}>
      <Phone at={s(5.6)} label="PERSONAL" icon="👤" from={-700} />
      <Phone at={s(6.5)} label="BRAND PAGE" icon="🏷️" from={700} />
    </div>
    <div style={{display: 'flex', gap: 24, alignItems: 'center'}}>
      <Word at={s(7.6)} text="DONO" size={120} red glitch />
      <Word at={s(8.1)} text="PROFESSIONALLY" size={90} />
    </div>
  </Center>
);

const Step: React.FC<{at: number; n: string; title: string; icon: string}> = ({at, n, title, icon}) => {
  const f = useCurrentFrame();
  const p = usePop(at, 12);
  if (f < at) return null;
  return (
    <div style={{transform: `translateX(${(1 - p) * 300}px)`, opacity: p, display: 'flex', alignItems: 'center', gap: 36, width: 880,
      padding: '34px 44px', borderRadius: 34, background: 'rgba(20,6,6,.85)', border: '3px solid rgba(255,30,30,.85)',
      boxShadow: '0 0 40px rgba(255,30,30,.45)'}}>
      <div style={{width: 120, height: 120, borderRadius: 99, background: RED, display: 'grid', placeItems: 'center', fontSize: 60, boxShadow: '0 0 40px rgba(255,30,30,1)'}}>{icon}</div>
      <div>
        <div style={{fontFamily: INTER, fontWeight: 700, fontSize: 34, color: RED, letterSpacing: 6}}>STEP {n}</div>
        <div style={{fontFamily: ANTON, fontSize: 76, color: WHITE, textShadow: glowW, lineHeight: 1.1}}>{title}</div>
      </div>
    </div>
  );
};

const SceneProcess: React.FC = () => {
  const f = useCurrentFrame();
  const line = interpolate(f, [s(9.8), s(13.2)], [0, 100], clamp);
  return (
    <Center style={{gap: 50}}>
      <Word at={s(9.5)} text="Process simple hai" size={70} font={INTER} />
      <div style={{position: 'relative', display: 'flex', flexDirection: 'column', gap: 50}}>
        <div style={{position: 'absolute', left: 104, top: 80, width: 8, height: `${line * 0.78}%`, background: RED, boxShadow: '0 0 24px rgba(255,30,30,1)', borderRadius: 8}} />
        <Step at={s(9.8)} n="01" title="AAP VIDEOS BHEJO" icon="📩" />
        <Step at={s(11.6)} n="02" title="MAIN EDIT KARUNGA" icon="✂️" />
        <Step at={s(12.85)} n="03" title="TIME PE UPLOAD" icon="🚀" />
      </div>
      <div style={{display: 'flex', gap: 14}}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => {
          const at = s(13.5) + i * 4;
          const on = f >= at;
          return <div key={i} style={{width: 100, height: 110, borderRadius: 18, border: '2px solid rgba(255,255,255,.35)', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', fontFamily: INTER, fontWeight: 700, fontSize: 30, color: WHITE, gap: 4,
            background: on ? 'rgba(255,30,30,.25)' : 'transparent', opacity: f >= s(13.3) ? 1 : 0}}>
            {d}<span style={{fontSize: 40, color: RED, textShadow: glowR, transform: `scale(${on ? 1 : 0})`}}>✓</span></div>;
        })}
      </div>
    </Center>
  );
};

const Card: React.FC<{at: number; title: string; icon: string}> = ({at, title, icon}) => {
  const f = useCurrentFrame();
  const p = usePop(at, 10);
  if (f < at) return null;
  const pulse = 0.6 + Math.sin((f - at) / 6) * 0.25;
  return (
    <div style={{transform: `scale(${p}) rotate(${(1 - p) * -12}deg)`, width: 430, height: 430, borderRadius: 40, background: 'linear-gradient(160deg,#1c0707,#080808)',
      border: `4px solid ${RED}`, boxShadow: `0 0 ${50 * pulse}px rgba(255,30,30,${pulse})`, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 24}}>
      <div style={{fontSize: 150}}>{icon}</div>
      <div style={{fontFamily: ANTON, fontSize: 62, color: WHITE, textShadow: glowW, textAlign: 'center', lineHeight: 1}}>{title}</div>
    </div>
  );
};

const SceneServices: React.FC = () => (
  <Center style={{gap: 40}}>
    <div style={{display: 'grid', gridTemplateColumns: '430px 430px', gap: 40}}>
      <Card at={s(15.5)} title="GYM VIDEOS" icon="🏋️" />
      <Card at={s(16.5)} title="INFLUENCER REELS" icon="⭐" />
      <Card at={s(17.5)} title="PERSONAL CONTENT" icon="🎥" />
      <Card at={s(18.6)} title="AI VIDEOS" icon="🤖" />
    </div>
    <div style={{display: 'flex', gap: 24, marginTop: 30}}>
      <Pill at={s(19.9)} text="Simple" />
      <Pill at={s(20.5)} text="Professional" red />
    </div>
  </Center>
);

const SceneKaam: React.FC = () => {
  const f = useCurrentFrame();
  const zoom = interpolate(f, [SC.kaam[0], SC.kaam[1]], [1, 1.15], clamp);
  return (
    <Center style={{transform: `scale(${zoom})`, gap: 10}}>
      <Word at={s(24.6)} text="AAP BAS" size={150} />
      <Word at={s(25.0)} text="APNA KAAM" size={190} red glitch />
      <Word at={s(25.5)} text="KARO" size={220} />
    </Center>
  );
};

const ScenePayment: React.FC = () => {
  const f = useCurrentFrame();
  const unlock = interpolate(f, [s(27.9), s(28.3)], [0, 1], {...clamp, easing: Easing.out(Easing.back(3))});
  const p = usePop(s(26.3), 12);
  return (
    <Center style={{gap: 60}}>
      <Word at={s(26.3)} text="PAYMENT" size={190} />
      <Word at={s(26.8)} text="ADVANCE MEIN" size={120} red glitch />
      <div style={{transform: `scale(${p})`, position: 'relative', width: 260, height: 300}}>
        <div style={{position: 'absolute', left: 55, top: 0, width: 150, height: 170, border: `22px solid ${WHITE}`, borderBottom: 'none', borderRadius: '90px 90px 0 0',
          boxShadow: '0 0 30px rgba(255,255,255,.7)', transformOrigin: '100% 100%', transform: `translateY(${-unlock * 40}px) rotate(${unlock * 30}deg)`}} />
        <div style={{position: 'absolute', bottom: 0, width: 260, height: 170, borderRadius: 30, background: f >= s(27.95) ? RED : '#333',
          boxShadow: f >= s(27.95) ? '0 0 60px rgba(255,30,30,1)' : undefined, display: 'grid', placeItems: 'center', fontSize: 80, color: WHITE}}>{f >= s(27.95) ? '✓' : '•'}</div>
      </div>
      <div style={{display: 'flex', gap: 24, alignItems: 'center'}}>
        <Word at={s(28.1)} text="KAAM" size={100} />
        <Word at={s(28.6)} text="TURANT START" size={100} red />
      </div>
    </Center>
  );
};

// ---------- face scenes ----------
const Face: React.FC<{from: number; to: number}> = ({from, to}) => {
  const f = useCurrentFrame();
  const zoom = interpolate(f, [0, to - from], [1.12, 1.22], clamp);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <OffthreadVideo src={staticFile('avatar.mp4')} muted startFrom={from} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`, transformOrigin: '50% 30%', filter: 'contrast(1.08) saturate(1.05)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.15) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,.75) 100%)'}} />
      <AbsoluteFill style={{boxShadow: 'inset 0 0 220px rgba(120,0,0,.55)'}} />
    </AbsoluteFill>
  );
};

const Caption: React.FC<{lines: {at: number; text: string; red?: boolean; size?: number}[]; top?: number}> = ({lines, top = 1250}) => (
  <AbsoluteFill style={{alignItems: 'center', top, height: 'auto'}}>
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
      {lines.map((l, i) => <Word key={i} at={l.at} text={l.text} size={l.size ?? 120} red={l.red} glitch={l.red} />)}
    </div>
  </AbsoluteFill>
);

const DMButton: React.FC = () => {
  const f = useCurrentFrame();
  const at = s(32.0);
  const p = usePop(at, 9);
  if (f < at) return null;
  const tap = s(32.55);
  const press = f >= tap && f < tap + 5 ? 0.9 : 1;
  const ring = interpolate(f, [tap, tap + 15], [0, 1], clamp);
  const cx = interpolate(f, [at, tap], [360, 40], {...clamp, easing: Easing.out(Easing.cubic)});
  const cy = interpolate(f, [at, tap], [260, 30], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <AbsoluteFill style={{alignItems: 'center', top: 1500, height: 'auto'}}>
      <div style={{position: 'relative', transform: `scale(${p * press})`}}>
        <div style={{padding: '34px 90px', borderRadius: 999, background: RED, fontFamily: ANTON, fontSize: 110, color: WHITE, letterSpacing: 4,
          boxShadow: `0 0 50px rgba(255,30,30,1), 0 0 140px rgba(255,30,30,.7)`, display: 'flex', alignItems: 'center', gap: 30}}>
          <span style={{fontSize: 90}}>✉</span> DM KARO
        </div>
        {f >= tap && <div style={{position: 'absolute', left: '50%', top: '50%', width: 900 * ring, height: 900 * ring * 0.4, marginLeft: -450 * ring, marginTop: -180 * ring,
          borderRadius: 999, border: `6px solid rgba(255,255,255,${1 - ring})`}} />}
        <div style={{position: 'absolute', left: '50%', top: '50%', transform: `translate(${cx}px, ${cy}px)`, fontSize: 110, filter: 'drop-shadow(0 0 10px #000)'}}>👆</div>
      </div>
      {HANDLE && <div style={{marginTop: 50, fontFamily: INTER, fontWeight: 900, fontSize: 64, color: WHITE, textShadow: glowW, opacity: interpolate(f, [tap, tap + 8], [0, 1], clamp)}}>{HANDLE}</div>}
    </AbsoluteFill>
  );
};

// ---------- global transitions ----------
const Flash: React.FC = () => {
  const f = useCurrentFrame();
  const c = CUTS.find((x) => f >= x && f < x + 5);
  if (c === undefined) return null;
  const o = interpolate(f - c, [0, 4], [0.85, 0], clamp);
  return <AbsoluteFill style={{background: (c / FPS) % 2 < 1 ? WHITE : RED, opacity: o, mixBlendMode: 'screen'}} />;
};

const Punch: React.FC<{children: React.ReactNode}> = ({children}) => {
  const f = useCurrentFrame();
  const c = [...CUTS].reverse().find((x) => f >= x) ?? 0;
  const sc = interpolate(f - c, [0, 6], [1.08, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const shake = f - c < 4 ? Math.sin(f * 7) * 10 : 0;
  return <AbsoluteFill style={{transform: `scale(${sc}) translate(${shake}px, ${-shake}px)`}}>{children}</AbsoluteFill>;
};

const MG: React.FC<{range: readonly [number, number]; children: React.ReactNode}> = ({range, children}) => (
  <Sequence from={range[0]} durationInFrames={range[1] - range[0]} layout="none">
    <AbsoluteFill>
      <MGBackground />
      {children}
    </AbsoluteFill>
  </Sequence>
);

// Wrap so scene components see ABSOLUTE frame (we use absolute timings everywhere)
const Abs: React.FC<{range: readonly [number, number]; children: React.ReactNode}> = ({range, children}) => {
  const f = useCurrentFrame();
  if (f < range[0] || f >= range[1]) return null;
  return <AbsoluteFill>{children}</AbsoluteFill>;
};

const SFX_HITS = [s(3.5), s(7.6), s(15.5), s(16.5), s(17.5), s(18.6), s(25.0), s(26.8), s(32.0)];
const SFX_TICKS = [s(9.8), s(11.6), s(12.85), s(27.95), s(32.55), ...Array.from({length: 7}, (_, i) => s(13.5) + i * 4)];

export const Portfolio: React.FC = () => {
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Audio src={staticFile('avatar.mp4')} />
      {CUTS.map((c) => <Sequence key={'w' + c} from={Math.max(0, c - 6)} durationInFrames={13}><Audio src={staticFile('whoosh.wav')} volume={0.55} /></Sequence>)}
      {SFX_HITS.map((c) => <Sequence key={'h' + c} from={c} durationInFrames={15}><Audio src={staticFile('hit.wav')} volume={0.5} /></Sequence>)}
      {SFX_TICKS.map((c, i) => <Sequence key={'t' + i} from={c} durationInFrames={3}><Audio src={staticFile('tick.wav')} volume={0.35} /></Sequence>)}

      <Punch>
        {/* FACE 1 */}
        <Sequence from={SC.face1[0]} durationInFrames={SC.face1[1] - SC.face1[0]} layout="none"><Face from={SC.face1[0]} to={SC.face1[1]} /></Sequence>
        <Abs range={SC.face1}>
          <Caption lines={[{at: 2, text: 'AAPKA', size: 110}, {at: s(0.5), text: 'INSTAGRAM', red: true, size: 170}, {at: s(1.4), text: 'MAIN HANDLE KARUNGA', size: 90}]} />
        </Abs>

        <Abs range={SC.tension}><MGBackground /><SceneTension /></Abs>
        <Abs range={SC.profiles}><MGBackground /><SceneProfiles /></Abs>
        <Abs range={SC.process}><MGBackground /><SceneProcess /></Abs>
        <Abs range={SC.services}><MGBackground /><SceneServices /></Abs>

        {/* FACE 2 */}
        <Sequence from={SC.face2[0]} durationInFrames={SC.face2[1] - SC.face2[0]} layout="none"><Face from={SC.face2[0]} to={SC.face2[1]} /></Sequence>
        <Abs range={SC.face2}>
          <Caption lines={[{at: s(22.3), text: 'NA EDITING KI', size: 110}, {at: s(22.9), text: 'TENSION', red: true, size: 170}, {at: s(23.5), text: 'NA POSTING KI', size: 110}]} />
        </Abs>

        <Abs range={SC.kaam}><MGBackground /><SceneKaam /></Abs>
        <Abs range={SC.payment}><MGBackground /><ScenePayment /></Abs>

        {/* FACE 3 — CTA */}
        <Sequence from={SC.face3[0]} durationInFrames={SC.face3[1] - SC.face3[0]} layout="none"><Face from={SC.face3[0]} to={SC.face3[1]} /></Sequence>
        <Abs range={SC.face3}>
          <Caption top={1150} lines={[{at: s(30.15), text: 'INSTAGRAM', red: true, size: 150}, {at: s(30.8), text: 'HANDLE KARWANA HAI?', size: 95}]} />
          <DMButton />
        </Abs>
      </Punch>
      <Flash />
    </AbsoluteFill>
  );
};
