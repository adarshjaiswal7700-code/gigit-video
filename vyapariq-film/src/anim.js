// Deterministic timeline for "Mishra ji aur VyaparIQ"
const $ = id => document.getElementById(id);
const VO = window.VO;
const W = (k, i) => VO[k].start + VO[k].words[i][1];
const E = (k) => VO[k].start + VO[k].dur;
const END = 91.8;
window.END = END;

const tl = gsap.timeline({ paused: true });
const P = {
  CENTER: { x: 557, y: 67, scale: 0.72 },
  LEFT: { x: 60, y: 67, scale: 0.72 },
  SMALL: { x: -30, y: 396, scale: 0.5 },
  CLOSE: { x: -114, y: 42, scale: 1.45 },
};
const cw = $('charWrap');
gsap.set(cw, { ...P.CENTER, y: 1200 });
tl.set(cw, { ...P.CENTER, y: 1200 }, 0);
tl.set('#clickRing', { opacity: 0 }, 0);

const hidden = ['nameTag','badge30','chipNaam','chipIzzat','register','phone','ringA','ringB','bub1','bub2','bub3','stampKal',
  'thinkGrp','td1','td2','think','th1','th2','cal','diya','needs','need1','need2','need3','intezaar','browser','logoCard','indiaTag','bug',
  's5title','toast','pulse','pLabA','pLabB','pLabC','s6title','recv','casc','aiCall','s7title','pBub','arrow','promise','logged',
  'riskGrp','rk1','rk2','rk3','road','truck','barrier','holdTag','result','thinkGrp2','te1','te2','think2','tk1','tk2',
  'stats','endLine','cta','ch7','chNo','chSet','btn','urlPill','cursor'];
hidden.forEach(id => gsap.set($(id), { autoAlpha: 0 }));
document.querySelectorAll('.reg').forEach(e => gsap.set(e, { autoAlpha: 0 }));

function inn(id, t, from = {}, dur = 0.6, ease = 'back.out(1.5)') {
  const el = typeof id === 'string' ? $(id) : id;
  const to = { autoAlpha: 1, duration: dur, ease };
  for (const k in from) to[k] = k.startsWith('scale') ? 1 : (k === 'filter' ? 'blur(0px)' : 0);
  if ('rotationX' in from) to.rotationX = 0;
  tl.fromTo(el, { autoAlpha: 0, ...from }, to, t);
}
function out(id, t, to = {}, dur = 0.4) {
  const el = typeof id === 'string' ? $(id) : id;
  tl.to(el, { autoAlpha: 0, duration: dur, ease: 'power2.in', ...to }, t);
}
function hl(id, t, box, parentW, dur) {
  // box in source pixel coords of screenshot; parentW = displayed width / source width
  const el = $(id); const s = parentW;
  gsap.set(el, { left: box[0] * s, top: box[1] * s, width: (box[2] - box[0]) * s, height: (box[3] - box[1]) * s });
  tl.fromTo(el, { autoAlpha: 0, scale: 1.15 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'back.out(2)' }, t);
  if (dur) tl.to(el, { autoAlpha: 0, duration: 0.3 }, t + dur);
}
function bg(id, a, b) {
  tl.fromTo($(id), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7, ease: 'none' }, a);
  if (b) tl.to($(id), { autoAlpha: 0, duration: 0.6, ease: 'none' }, b);
}

// ---------- BG sets ----------
bg('bgA', 0.0, 7.7); bg('bgB', 7.9, 11.4); bg('bgC', 11.5, 20.5); bg('bgD', 20.7, 24.8); bg('bgE', 24.9, 31.7);
bg('bgF', 31.9, 47.2); bg('bgG', 47.4, 68.3); bg('bgH', 68.5, 76.3); bg('bgI', 76.5);
// blobs
tl.fromTo('#blob1', { opacity: 0 }, { opacity: .45, duration: 2 }, 0);
tl.to('#blob1', { opacity: .15, duration: 1 }, 7.9);
tl.fromTo('#blob3', { opacity: 0 }, { opacity: .35, duration: 1.2 }, 8.5).to('#blob3', { opacity: 0, duration: 1 }, 24.5);
tl.fromTo('#blob4', { opacity: 0 }, { opacity: .5, duration: 1 }, 25).to('#blob4', { opacity: 0, duration: .8 }, 31.6);
tl.to('#blob1', { opacity: .45, duration: 1 }, 31.9);
tl.fromTo('#blob2', { opacity: 0 }, { opacity: .45, duration: 1.5 }, 32.5);

// ---------- SCENE 1 : intro ----------
tl.to(cw, { y: P.CENTER.y, duration: 1.4, ease: 'power3.out' }, 0.15);
tl.fromTo('#world', { scale: 1.06, transformOrigin: '50% 40%' }, { scale: 1, duration: 7.5, ease: 'power1.out' }, 0);
inn('nameTag', W('n01', 2) - 0.1, { x: 80 }, 0.7, 'power3.out');
inn('badge30', W('n01', 6) - 0.05, { scale: 0.4 });
inn('chipNaam', W('n01', 15) - 0.05, { scale: 0.4 });
inn('chipIzzat', W('n01', 17) - 0.05, { scale: 0.4 });
['nameTag', 'badge30', 'chipNaam', 'chipIzzat'].forEach((id, i) => out(id, 7.7 + i * 0.04, { x: 60 }));

// udhaar register
tl.to(cw, { ...P.LEFT, duration: 0.9, ease: 'power3.inOut' }, 7.75);
inn('register', 8.0, { x: 120, rotationY: -12 }, 0.8, 'power3.out');
document.querySelectorAll('.reg').forEach((e, i) => inn(e, 8.4 + i * 0.28, { x: 40 }, 0.45, 'power2.out'));
const udh = { v: 0 };
tl.fromTo(udh, { v: 0 }, { v: 2200000, duration: 1.3, ease: 'power2.out', onUpdate: () => { $('udhaarNum').textContent = inr(udh.v); } }, W('n02', 6) - 0.1);
tl.fromTo('#udhaarNum', { scale: 1 }, { scale: 1.12, duration: .15, yoyo: true, repeat: 1, transformOrigin: '100% 50%' }, W('n02', 6) + 1.2);
out('register', 11.3, { x: 100 });

// ---------- SCENE 2 : phone + excuses ----------
inn('phone', 11.35, { y: 80, rotation: 0, scale: 0.6 }, 0.5);
tl.set('#phone', { rotation: 10 }, 11.86);
inn('bub1', W('p01', 0) - 0.05, { scale: 0.5, y: 30 }, 0.5);
inn('bub2', W('p02', 0) - 0.05, { scale: 0.5, y: 30 }, 0.5);
inn('bub3', W('p03', 0) - 0.05, { scale: 0.5, y: 30 }, 0.5);
tl.fromTo('#stampKal', { autoAlpha: 0, scale: 2.4, rotation: -14 }, { autoAlpha: 1, scale: 1, rotation: -10, duration: 0.35, ease: 'power4.in' }, 19.75);
['phone', 'bub1', 'bub2', 'bub3', 'stampKal'].forEach((id, i) => out(id, 20.4 + i * 0.05, { scale: 0.9 }));

// m01 close-up thought
tl.to(cw, { ...P.CLOSE, duration: 1.1, ease: 'power3.inOut' }, 20.45);
tl.to('#vig', { opacity: 1, duration: 1 }, 20.6); tl.to('#vig', { opacity: 0, duration: 0.8 }, 24.6);
tl.to('#cool', { opacity: 1, duration: 1 }, 20.6); tl.to('#cool', { opacity: 0, duration: 0.8 }, 24.6);
tl.to('#charBreath', { filter: 'saturate(0.7)', duration: 1 }, 20.6); tl.to('#charBreath', { filter: 'saturate(1)', duration: 0.8 }, 24.6);
tl.set('#thinkGrp', { autoAlpha: 1 }, 20.9);
inn('td1', 21.0, { scale: 0 }, 0.3); inn('td2', 21.15, { scale: 0 }, 0.3); inn('think', 21.25, { scale: 0.6 }, 0.5);
inn('th1', W('m01', 0), { y: 20 }, 0.5, 'power3.out');
inn('th2', W('m01', 4), { y: 20 }, 0.5, 'power3.out');
out('thinkGrp', 24.55);

// ---------- SCENE 3 : Diwali ----------
tl.to(cw, { ...P.LEFT, duration: 1.0, ease: 'power3.inOut' }, 24.6);
inn('cal', W('n04', 2) - 0.2, { y: -80, rotation: -6 }, 0.6);
inn('diya', W('n04', 2), { scale: 0.3, y: 40 }, 0.6);
inn('needs', W('n04', 5) - 0.3, { y: 60 }, 0.6, 'power3.out');
inn('need1', W('n04', 6) - 0.1, { x: 40 }, 0.4, 'power2.out');
inn('need2', W('n04', 10) - 0.1, { x: 40 }, 0.4, 'power2.out');
inn('need3', W('n04', 14) - 0.1, { x: 40 }, 0.4, 'power2.out');
inn('intezaar', W('n04', 16) - 0.1, { y: 30 }, 0.5, 'power3.out');
tl.to('#world', { filter: 'saturate(0.55)', duration: 0.8 }, W('n04', 16));
tl.to('#world', { filter: 'saturate(1)', duration: 0.3 }, 31.75);
['cal', 'diya', 'needs', 'intezaar'].forEach((id, i) => out(id, 31.6 + i * 0.03, { scale: 0.92 }, 0.3));

// ---------- SCENE 4 : reveal ----------
tl.set('#wipe', { left: 960 - 150, top: 540 - 150 }, 31.6);
tl.fromTo('#wipe', { scale: 0, opacity: 1 }, { scale: 9, duration: 0.45, ease: 'power3.in' }, 31.7);
tl.to('#wipe', { opacity: 0, duration: 0.5, ease: 'power1.out' }, 32.15);
tl.set(cw, { ...P.SMALL }, 32.15);
tl.set(cw, { x: -400 }, 32.16);
tl.to(cw, { x: P.SMALL.x, duration: 0.8, ease: 'power3.out' }, 32.2);
inn('browser', W('n05', 5) - 0.25, { scale: 0.25, x: -520, y: 330, rotationY: 25 }, 0.9, 'power3.out');
tl.fromTo('#browser img', { y: 0 }, { y: -120, duration: 3.5, ease: 'power1.inOut' }, W('n05', 5) + 0.6);
tl.to('#browser', { filter: 'blur(5px)', opacity: 0.45, duration: 0.5 }, W('n05', 8) - 0.15);
inn('logoCard', W('n05', 8) - 0.15, { scale: 0.5, filter: 'blur(10px)' }, 0.7, 'back.out(1.6)');
inn('indiaTag', W('n05', 10) - 0.1, { y: 30 }, 0.5, 'power3.out');
out('browser', 38.4, { y: 60 });
out('indiaTag', 38.4);
tl.to('#logoCard', { autoAlpha: 0, scale: 0.3, x: 560, y: -260, duration: 0.6, ease: 'power3.in' }, 38.4);
inn('bug', 38.85, { scale: 0.5 }, 0.5);

// ---------- SCENE 5 : Daily Pulse ----------
inn('s5title', W('n06', 0), { y: 30 }, 0.6, 'power3.out');
inn('toast', W('n06', 5) - 0.1, { y: -60, scale: 0.9 }, 0.55, 'back.out(1.7)');
inn('pulse', W('n06', 9) - 0.15, { x: 140, rotationY: -18, scale: 0.9 }, 0.8, 'power3.out');
{ const s = 690 / 925;
  hl('hlA', W('n06', 11) - 0.05, [42, 168, 322, 336], s, 1.6);
  hl('hlB', W('n06', 14) - 0.05, [326, 168, 606, 336], s, 1.6);
  hl('hlC', W('n06', 19) - 0.05, [30, 370, 900, 755], s, 0); }
tl.to('#toast', { y: -40, autoAlpha: 0, duration: 0.4 }, W('n06', 11) - 0.3);
inn('pLabA', W('n06', 11) - 0.05, { x: -40 }, 0.45, 'power3.out');
inn('pLabB', W('n06', 14) - 0.05, { x: -40 }, 0.45, 'power3.out');
inn('pLabC', W('n06', 19) - 0.05, { x: -40 }, 0.45, 'power3.out');
['s5title', 'pulse', 'pLabA', 'pLabB', 'pLabC'].forEach((id, i) => out(id, 47.15 + i * 0.04, { x: -40 }, 0.35));

// ---------- SCENE 6 : cascade ----------
inn('s6title', W('n07', 0) - 0.1, { y: 30 }, 0.6, 'power3.out');
tl.fromTo('#strike', { width: 0 }, { width: () => $('mjS').offsetWidth + 12, duration: 0.35, ease: 'power2.out' }, W('n07', 3));
inn('recv', W('n07', 5) - 0.2, { y: 80, rotationX: 15 }, 0.8, 'power3.out');
inn('casc', W('n07', 9) - 0.3, { x: 120 }, 0.7, 'power3.out');
{ const s = 500 / 505;
  hl('hc1', W('n07', 12) - 0.05, [16, 108, 490, 210], s, 1.4);
  hl('hc2', W('n07', 15) - 0.05, [16, 220, 490, 322], s, 1.5);
  hl('hc3', W('n07', 27) - 0.25, [16, 333, 490, 435], s, 0); }
inn('aiCall', W('n07', 27) - 0.2, { y: 60, scale: 0.85 }, 0.55, 'back.out(1.6)');
['s6title', 'recv', 'casc', 'aiCall'].forEach((id, i) => out(id, 58.1 + i * 0.04, { y: -40 }, 0.35));

// ---------- SCENE 7 : promise + risk ----------
inn('s7title', W('n08', 0) - 0.1, { y: 30 }, 0.6, 'power3.out');
inn('pBub', W('n08', 1) - 0.1, { scale: 0.5 }, 0.5);
inn('arrow', W('n08', 4), { x: -30 }, 0.4, 'power2.out');
inn('promise', W('n08', 4) + 0.15, { x: 80 }, 0.6, 'power3.out');
tl.fromTo('#logged', { autoAlpha: 0, scale: 2.2 }, { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'power4.in' }, W('n08', 8));
tl.to(['#pBub', '#arrow'], { autoAlpha: 0, duration: 0.4 }, W('n08', 11) - 0.2);
tl.to('#promise', { x: -630, y: -40, scale: 0.85, transformOrigin: '0 0', duration: 0.7, ease: 'power3.inOut' }, W('n08', 11) - 0.2);
tl.set('#riskGrp', { autoAlpha: 1 }, W('n08', 11));
inn('rk1', W('n08', 12), { y: 40 }, 0.45, 'power3.out');
inn('rk2', W('n08', 13), { y: 40 }, 0.45, 'power3.out');
inn('rk3', W('n08', 14), { y: 40 }, 0.45, 'power3.out');
tl.to('#rk3', { borderColor: 'rgba(229,72,77,1)', duration: 0.2 }, W('n08', 18));
tl.fromTo('#riskyTag', { scale: 1 }, { scale: 1.5, duration: .18, yoyo: true, repeat: 3, ease: 'power1.inOut' }, W('n08', 18));
inn('road', W('n08', 20) - 0.3, { scaleX: 0 }, 0.4, 'power2.out');
inn('barrier', W('n08', 20) - 0.2, { y: 30 }, 0.4, 'power2.out');
tl.fromTo('#truck', { autoAlpha: 0, x: -60 }, { autoAlpha: 1, x: 0, duration: 0.3 }, W('n08', 20) - 0.2);
tl.to('#truck', { x: 380, duration: 1.4, ease: 'power2.out' }, W('n08', 20));
tl.to('#boom', { rotation: 0, duration: 0.35, ease: 'bounce.out' }, W('n08', 22) - 0.2);
inn('holdTag', W('n08', 23), { scale: 0.5 }, 0.45);
['s7title', 'promise', 'riskGrp', 'road', 'truck', 'barrier', 'holdTag'].forEach((id) => out(id, 68.15, { y: 30 }, 0.35));

// ---------- SCENE 8 : result ----------
tl.to('#bug', { autoAlpha: 0, duration: 0.3 }, 68.3);
tl.to(cw, { ...P.LEFT, duration: 1.0, ease: 'power3.inOut' }, 68.35);
tl.set('#glow', { left: 60 + 560 * 0.72 - 700, top: 67 + 420 * 0.72 - 700 }, 68.3);
tl.to('#glow', { opacity: 1, duration: 1.2 }, 70.3);
inn('result', W('n09', 0) + 0.1, { x: 120 }, 0.7, 'power3.out');
const rec = { v: 0 };
tl.fromTo(rec, { v: 0 }, { v: 1800000, duration: 1.2, ease: 'power3.out', onUpdate: () => { $('recNum').textContent = inr(rec.v); } }, W('n09', 4) - 0.05);
tl.fromTo('#recBar', { width: '0%' }, { width: '82%', duration: 1.2, ease: 'power3.out' }, W('n09', 4) - 0.05);
tl.fromTo('#recNum', { scale: 1 }, { scale: 1.08, duration: .16, yoyo: true, repeat: 1, transformOrigin: '0 50%' }, W('n09', 4) + 1.15);
out('result', 72.35, { x: 80 });
tl.to(cw, { ...P.CLOSE, duration: 1.0, ease: 'power3.inOut' }, 72.3);
tl.to('#glow', { left: -114 + 520 * 1.45 - 700, top: 42 + 330 * 1.45 - 700, duration: 1.0, ease: 'power3.inOut' }, 72.3);
tl.set('#thinkGrp2', { autoAlpha: 1 }, 72.7);
inn('te1', 72.8, { scale: 0 }, 0.3); inn('te2', 72.95, { scale: 0 }, 0.3); inn('think2', 73.05, { scale: 0.6 }, 0.5);
inn('tk1', W('m02', 0), { y: 20 }, 0.5, 'power3.out');
inn('tk2', W('m02', 3), { y: 20 }, 0.5, 'power3.out');
out('thinkGrp2', 76.2);
tl.to('#glow', { opacity: 0, duration: 0.6 }, 76.2);

// ---------- SCENE 9 : end ----------
tl.to(cw, { ...P.SMALL, duration: 1.0, ease: 'power3.inOut' }, 76.25);
inn('stats', W('n10', 0) - 0.1, { y: 60, scale: 0.92 }, 0.7, 'power3.out');
inn('endLine', W('n10', 5) - 0.2, { y: 40 }, 0.6, 'power3.out');
tl.fromTo('#strike2', { width: 0 }, { width: () => $('strike2').parentNode.offsetWidth + 12, duration: 0.35 }, W('n10', 7));
tl.fromTo('#collWord', { scale: 0.6, transformOrigin: '0 50%' }, { scale: 1, duration: 0.5, ease: 'back.out(2)' }, W('n10', 8) - 0.1);
out('stats', W('n10', 11) - 0.45, { y: -60 });
out('endLine', W('n10', 11) - 0.45, { y: -60 });
inn('cta', W('n10', 11) - 0.2, { y: 80, scale: 0.94 }, 0.8, 'power3.out');
inn('ch7', W('n10', 11), { scale: 0.4 }, 0.45);
inn('chNo', W('n10', 16), { scale: 0.4 }, 0.45);
inn('chSet', W('n10', 18) + 0.2, { scale: 0.4 }, 0.45);
inn('btn', W('n10', 19) - 0.1, { scale: 0.6 }, 0.5);
inn('urlPill', W('n10', 23) - 0.1, { scale: 0.6 }, 0.5);
tl.fromTo('#cursor', { autoAlpha: 0, x: 300, y: 120 }, { autoAlpha: 1, x: 0, y: 0, duration: 0.9, ease: 'power2.out' }, 86.3);
tl.set('#cursor', { left: 1112, top: 655 }, 0);
tl.set('#clickRing', { left: 1078, top: 615 }, 0);
tl.fromTo('#btn', { scale: 1 }, { scale: 0.93, duration: 0.1, yoyo: true, repeat: 1 }, 87.25);
tl.fromTo('#clickRing', { opacity: 0.9, scale: 0.3 }, { opacity: 0, scale: 2.2, duration: 0.6, immediateRender: false }, 87.25);
tl.to('#world', { scale: 1.04, transformOrigin: '65% 45%', duration: 5, ease: 'power1.inOut' }, 86.8);
tl.to('#cursor', { autoAlpha: 0, duration: .4 }, 88.4);

// ---------- captions ----------
const CAP = {
  n01: [[0, 3, 'Yeh hain *Mishra ji*.'], [4, 12, 'Kanpur mein *30 saal* se kapde ka wholesale business.'], [13, 18, 'Bazaar mein naam hai, izzat hai…']],
  n02: [[0, 5, 'Aur usi bazaar mein phansa hai…'], [6, 10, '*₹22 lakh* ka udhaar.']],
  n03: [[0, 5, 'Phone karo, toh wahi purane *bahaane*.']],
  p01: [[0, 9, '"Arre Mishra ji, cheque toh kal hi nikal gaya tha!"']],
  p02: [[0, 5, '"Is hafte thoda tight hai bhaisaab…"']],
  p03: [[0, 8, '"Aap toh ghar ke ho, agle mahine *pakka*!"']],
  m01: [[0, 3, 'Apna hi paisa hai…'], [4, 10, 'phir bhi maangne mein *sharam* aati hai.']],
  n04: [[0, 4, 'Upar se *Diwali* sar par.'], [5, 12, 'Naya stock chahiye, staff ka bonus dena hai…'], [13, 17, 'aur galle mein? Sirf *intezaar*.']],
  n05: [[0, 7, 'Phir ek din, pote ne laptop par dikhaya…'], [8, 14, '*VyaparIQ* — India ka AI Collections OS.']],
  n06: [[0, 10, 'Ab har subah 8 baje, WhatsApp par aata hai *Daily Pulse*.'], [11, 17, 'Kal kitna aaya, aaj ka target kitna,'], [18, 24, 'aur sabse pehle kise *call* karna hai.']],
  n07: [[0, 8, 'Takada ab Mishra ji nahi, *VyaparIQ* karta hai.'], [9, 14, 'Due date se pehle *friendly reminder*,'], [15, 20, 'due date par *one-tap UPI link*,'], [21, 31, 'aur phir bhi der ho, toh Hindi mein *AI voice call*.']],
  n08: [[0, 10, 'Har "agle hafte pakka" ab taareekh ke saath *record* hota hai.'], [11, 19, 'Aur jo party baar-baar latkaaye, us par *risk tag*…'], [20, 25, 'agla maal bhejne se pehle hi.']],
  n09: [[0, 3, 'Nateeja? Diwali se pehle…'], [4, 7, '*₹18 lakh* wapas.']],
  m02: [[0, 2, 'Rishta bhi bacha…'], [3, 6, 'aur *paisa* bhi aaya.']],
  n10: [[0, 10, '10,000+ businesses ab takada nahi, *collection* karte hain.'], [11, 18, '*7 din ka free trial*, bina credit card.'], [19, 26, 'Aaj hi shuru kijiye — *vyapariq.in*']],
};
const caps = [];
for (const k in CAP) {
  const ws = VO[k].words, st = VO[k].start;
  CAP[k].forEach(([a, b, txt], i) => {
    const s = st + ws[a][1] - 0.08;
    const nxt = CAP[k][i + 1];
    let e = nxt ? st + ws[nxt[0]][1] - 0.1 : st + ws[b][2] + 0.35;
    caps.push({ s, e, html: txt.replace(/\*(.+?)\*/g, '<b>$1</b>') });
  });
}
caps.sort((a, b) => a.s - b.s);
for (let i = 0; i < caps.length - 1; i++) caps[i].e = Math.min(caps[i].e, caps[i + 1].s - 0.02);

function inr(v) {
  v = Math.round(v / 1000) * 1000;
  const s = String(v); let last3 = s.slice(-3), rest = s.slice(0, -3);
  if (rest) rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',';
  return '₹' + rest + last3;
}

// ---------- procedural per-frame ----------
const rows = [...document.querySelectorAll('.bgrow')].map(r => ({ el: r, sp: +r.dataset.sp }));
const blinkTimes = []; { let t = 2.3, k = 0; while (t < END) { blinkTimes.push(t); t += 2.6 + ((k * 37) % 23) / 10; k++; } }
const waveEl = $('wave'); for (let i = 0; i < 26; i++) { const b = document.createElement('i'); b.style.cssText = 'display:block;width:6px;border-radius:3px;background:#7C4DFF;height:10px'; waveEl.appendChild(b); }
const waveBars = [...waveEl.children];
const cv = $('conf'), cx = cv.getContext('2d');
const confT = W('n09', 4);
const conf = []; { let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const cols = ['#7C4DFF', '#A855F7', '#16A34A', '#F59E0B', '#E5484D', '#0EA5E9', '#FACC15'];
  for (let i = 0; i < 220; i++) conf.push({ x: 1450 + (rnd() - 0.5) * 300, y: 380 + (rnd() - .5) * 100, vx: (rnd() - 0.5) * 1500, vy: -600 - rnd() * 900, r: rnd() * 6, vr: (rnd() - .5) * 14, c: cols[i % cols.length], w: 10 + rnd() * 10, h: 6 + rnd() * 8 }); }

function frame(t) {
  rows.forEach(r => { r.el.style.transform = `translateX(${(r.sp > 0 ? -1400 : 0) + r.sp * t}px)`; });
  // breathing + idle sway
  const br = Math.sin(t * 2 * Math.PI / 3.6);
  $('charBreath').style.transform = `translateY(${br * -3}px) scale(${1 + br * 0.004}) rotate(${Math.sin(t * 0.7) * 0.35}deg)`;
  // blink
  let st = 0; for (const b of blinkTimes) { const d = t - b; if (d >= 0 && d < 0.034) st = 1; else if (d >= 0.034 && d < 0.1) st = 2; else if (d >= 0.1 && d < 0.134) st = 1; }
  $('c1').style.opacity = st === 1 ? 1 : 0; $('c2').style.opacity = st === 2 ? 1 : 0;
  // phone vibrate + rings
  const ringing = t > 11.5 && t < 14.0;
  const ph = $('phone');
  const base = ph._gsap ? '' : '';
  $('phone').style.marginLeft = ringing ? (Math.sin(t * 90) * 4) + 'px' : '0px';
  ['ringA', 'ringB'].forEach((id, i) => {
    const el = $(id);
    if (t > 11.5 && t < 20.3) { const p = ((t - 11.5) * 0.9 + i * 0.5) % 1; el.style.opacity = (1 - p) * 0.8; el.style.visibility = 'visible'; el.style.transform = `scale(${0.6 + p * 2.6})`; }
    else { el.style.opacity = 0; }
  });
  // flame
  $('flame').style.transform = `scale(${1 + Math.sin(t * 13) * 0.05 + Math.sin(t * 7.3) * 0.04},${1 + Math.sin(t * 11) * 0.07}) rotate(${Math.sin(t * 5) * 3}deg)`;
  // clock hand
  $('clockHand').style.transform = `rotate(${Math.floor(t * 2) * 30}deg)`;
  // shake on "sirf intezaar"
  const sh = W('n04', 16); let sx = 0;
  if (t > sh && t < sh + 0.35) sx = Math.sin(t * 120) * 6 * (1 - (t - sh) / 0.35);
  $('stage').style.transform = `translateX(${sx}px)`;
  // AI call wave
  waveBars.forEach((b, i) => { const a = Math.abs(Math.sin(t * 9 + i * 0.7) * Math.sin(t * 3.1 + i * 0.33)); b.style.height = (6 + a * 28) + 'px'; });
  // confetti
  cx.clearRect(0, 0, 1920, 1080);
  const dt = t - confT;
  if (dt > 0 && dt < 3.2) {
    conf.forEach(p => {
      const x = p.x + p.vx * dt * 0.6, y = p.y + p.vy * dt + 900 * dt * dt;
      cx.save(); cx.translate(x, y); cx.rotate(p.r + p.vr * dt); cx.globalAlpha = Math.min(1, (3.2 - dt) * 1.5);
      cx.fillStyle = p.c; cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(dt * 6 + p.r))); cx.restore();
    });
  }
  // captions
  const c = caps.find(c => t >= c.s && t < c.e);
  const box = $('capBox');
  if (c) { if (box._h !== c.html) { box.innerHTML = c.html; box._h = c.html; }
    const a = Math.min(1, (t - c.s) / 0.12, (c.e - t) / 0.12); box.style.opacity = a; box.style.transform = `translateY(${(1 - Math.min(1, (t - c.s) / 0.15)) * 10}px)`; }
  else box.style.opacity = 0;
}
window.seek = function (t) { tl.seek(t, false); frame(t); };
window.seek(0);
