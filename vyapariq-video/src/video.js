/* ---------- VyaparIQ demo video – master timeline ----------
   48 s @ 30 fps. Music is 100 BPM, so one beat = 0.6 s; every major cut sits on that grid. */
const DURATION = 48;
const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---- helpers ---- */
function scene(id, a, b) {
  tl.set('#' + id, { visibility: 'visible', opacity: 1 }, a);
  if (b != null) tl.set('#' + id, { visibility: 'hidden', opacity: 0 }, b);
}
function reveal(els, t, o = {}) {
  tl.fromTo(els, { opacity: 0, filter: `blur(${o.blur ?? 16}px)`, y: o.y ?? 16, x: o.x ?? 0, scale: o.scale ?? 1 },
    { opacity: 1, filter: 'blur(0px)', y: 0, x: 0, scale: 1, duration: o.d ?? 0.55, stagger: o.st ?? 0.13, ease: o.ease ?? 'power3.out' }, t);
}
function blurOut(els, t, d = 0.32, o = {}) {
  tl.to(els, { opacity: 0, filter: `blur(${o.blur ?? 16}px)`, scale: o.scale ?? 0.97, duration: d, ease: 'power2.in' }, t);
}
function posIn(el, root) {           // layout position of el inside root (ignores transforms)
  let x = 0, y = 0;
  while (el && el !== root) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; }
  return { x, y };
}
function centerIn(el, root) { const p = posIn(el, root); return { x: p.x + el.offsetWidth / 2, y: p.y + el.offsetHeight / 2 }; }
function curSet(c, p, t) { tl.set(c, { x: p.x - 5, y: p.y - 4 }, t); }
function curMove(c, p, t, d = 0.55, ease = 'power2.inOut') { tl.to(c, { x: p.x - 5, y: p.y - 4, duration: d, ease }, t); }
function click(c, t) {
  const svg = $('svg', c), r = $('.ripple', c);
  tl.to(svg, { scale: 0.8, duration: 0.08, ease: 'power2.out', transformOrigin: '5px 4px' }, t)
    .to(svg, { scale: 1, duration: 0.18, ease: 'back.out(3)' }, t + 0.08)
    .fromTo(r, { opacity: 0.95, scale: 0.3 }, { opacity: 0, scale: 1.9, duration: 0.5, ease: 'power2.out', immediateRender: false }, t);
}
function press(el, t, s = 0.93) {
  tl.to(el, { scale: s, duration: 0.08, ease: 'power2.out' }, t).to(el, { scale: 1, duration: 0.25, ease: 'back.out(3)' }, t + 0.08);
}

/* ---- typewriter ---- */
function setupTW(el, text, key) {
  const k = text.indexOf(key);
  const ch = c => `<span class="ch">${c === ' ' ? '&nbsp;' : c}</span>`;
  el.innerHTML = [...text.slice(0, k)].map(ch).join('') + `<span class="grad">${[...key].map(ch).join('')}</span>` +
    [...text.slice(k + key.length)].map(ch).join('') + `<span class="caret"></span>`;
  const chars = $$('.ch', el), caret = $('.caret', el);
  return { chars, caret, edges: chars.map(c => posIn(c, el).x + c.offsetWidth + 6) };
}
function typeOn(tw, t0, dt = 0.055) {
  tl.set(tw.caret, { x: 0, opacity: 1 }, t0 - 0.01);
  tw.chars.forEach((c, i) => { tl.set(c, { visibility: 'visible' }, t0 + i * dt); tl.set(tw.caret, { x: tw.edges[i] }, t0 + i * dt); });
  return t0 + tw.chars.length * dt;
}
function blink(caret, a, b) { for (let t = a; t + 0.5 < b; t += 0.5) { tl.set(caret, { opacity: 0 }, t + 0.25); tl.set(caret, { opacity: 1 }, t + 0.5); } }

/* ---------------------------------------------------------------- */
function buildTimeline() {
  /* everything starts hidden / in its pre-state */
  tl.set(['#star-ring', '#iris'], { opacity: 0 }, 0);

  /* ===== S1 · HOOK  0.0 – 4.8 ===== */
  const twA = setupTW($('#twA'), COPY.hookA, COPY.hookAKey);
  const twB = setupTW($('#twB'), COPY.hookB, COPY.hookBKey);
  scene('s1', 0, 4.8);
  tl.set([twA.caret, twB.caret], { opacity: 0 }, 0);
  const endA = typeOn(twA, 0.12);
  tl.fromTo('#s1-text', { scale: 1 }, { scale: 0.64, duration: 0.55, ease: 'power3.inOut' }, 1.0);
  blink(twA.caret, endA, 2.3);
  tl.set(twA.chars, { visibility: 'hidden' }, 2.3).set(twA.caret, { opacity: 0 }, 2.3);
  const endB = typeOn(twB, 2.36);
  blink(twB.caret, endB, 4.8);
  const cards = $$('#s1-cards [data-c]');
  const drift = [[-30, 14], [20, -16], [26, 10], [-24, -12], [18, 12], [30, -10], [-20, 10]];
  cards.forEach((c, i) => {
    const far = c.hasAttribute('data-far');
    tl.fromTo(c, { opacity: 0, scale: 0.82, y: (i % 2 ? -1 : 1) * 70, filter: 'blur(18px)' },
      { opacity: far ? 0.55 : 1, scale: 1, y: 0, filter: far ? 'blur(5px)' : 'blur(0px)', duration: 0.7, ease: 'power3.out' }, 1.02 + i * 0.07);
    tl.to(c, { x: drift[i][0], y: drift[i][1], duration: 3.0, ease: 'sine.inOut' }, 1.75);
  });
  tl.fromTo('#s1-cards', { scale: 1.06 }, { scale: 1, duration: 3.8, ease: 'sine.out' }, 1.0);

  /* ===== S2 · MEET + LOGO  4.8 – 7.8 ===== */
  scene('s2', 4.8, 7.8);
  tl.fromTo('#s2-meet', { opacity: 0, filter: 'blur(26px)', scale: 1.1, x: -60 }, { opacity: 1, filter: 'blur(0px)', scale: 1, x: 0, duration: 0.4 }, 4.8);
  tl.to('#s2-meet', { x: 50, duration: 0.5, ease: 'none' }, 5.0);
  tl.to('#s2-meet', { x: 560, scaleX: 1.9, filter: 'blur(28px)', opacity: 0, duration: 0.14, ease: 'power2.in' }, 5.3);
  tl.fromTo('#s2-logo', { opacity: 0, x: -700, scaleX: 1.9, filter: 'blur(30px)' },
    { opacity: 1, x: 0, scaleX: 1, filter: 'blur(0px)', duration: 0.5, ease: 'expo.out' }, 5.38);
  tl.to('#s2-logo', { y: -95, scale: 0.8, duration: 0.5, ease: 'power3.inOut' }, 5.95);
  tl.fromTo('#s2-pill', { opacity: 0, clipPath: 'inset(0% 42% 0% 42% round 60px)' },
    { opacity: 1, clipPath: 'inset(0% 0% 0% 0% round 60px)', duration: 0.55, ease: 'power3.out' }, 6.1);
  reveal($$('#s2-pill .w'), 6.22, { st: 0.15, blur: 12, y: 8 });
  blurOut('#s2-wrap', 7.45, 0.32);

  /* ===== S3a · SEND BILLS  7.8 – 9.6 ===== */
  scene('s3a', 7.8, 9.62);
  tl.fromTo('#s3a-line', { x: 300 }, { x: -260, duration: 1.8, ease: 'sine.inOut' }, 7.8);
  reveal($$('#s3a-line .w'), 7.84, { st: 0.17, blur: 18, y: 0, x: 30 });
  blurOut('#s3a-line', 9.28, 0.3);

  /* ===== S3b · NEW MAIL MORPH  9.45 – 10.8  (beat drop at 9.6) ===== */
  scene('s3b', 9.42, 10.82);
  // measure the real text width so "New mail" is never clipped
  const nmTxtW = Math.ceil($('#nm-txt').scrollWidth) + 6;
  const nmBtnW = 64 + 26 + nmTxtW + 2 * 80;      // icon + gap + text + side padding
  tl.fromTo('#nm-btn', { opacity: 0, scale: 1.12, filter: 'blur(14px)', width: 300 }, { opacity: 1, scale: 1, filter: 'blur(0px)', width: 300, duration: 0.22 }, 9.42);
  tl.fromTo('#nm-txt', { width: 0, opacity: 0 }, { width: nmTxtW, opacity: 1, duration: 0.4, ease: 'power3.out' }, 9.6);
  tl.to('#nm-btn', { width: nmBtnW, duration: 0.4, ease: 'power3.out' }, 9.6);
  tl.fromTo('#nm-fill', { opacity: 0, xPercent: -60 }, { opacity: 1, xPercent: 0, duration: 0.35 }, 9.6);
  tl.fromTo('#nm-strip', { scaleX: 0.25, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.5, ease: 'expo.out' }, 9.75);
  tl.to('#nm-fill', { opacity: 0.0, duration: 0.5, ease: 'power2.inOut' }, 10.1);
  tl.to('#nm-group', { scale: 0.66, duration: 0.7, ease: 'power3.inOut' }, 10.05);
  tl.fromTo('#nm-glow', { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1.3, duration: 0.3, ease: 'power2.out' }, 10.45);

  /* ===== S3c · COMPOSE MAIL  10.8 – 14.4 ===== */
  scene('s3c', 10.8, 14.42);
  const winA = $('#mailA');
  const zone = centerIn($('.attach-chip', winA), winA);
  const rigA = '#s3c-rig';
  tl.fromTo(rigA, { y: 620, x: 120, rotationX: 48, rotationY: -22, rotationZ: 8, opacity: 0 },
    { y: 70, x: 0, rotationX: 22, rotationY: -16, rotationZ: 4, opacity: 1, duration: 0.7, ease: 'expo.out' }, 10.8);
  tl.to(rigA, { y: 40, x: -70, rotationY: -9, rotationX: 18, duration: 1.9, ease: 'sine.inOut' }, 11.5);
  const curA = $('#curA');
  tl.set('#drag-pdf', { x: 0, y: 0, opacity: 1, scale: 1, rotation: 6 }, 10.8);
  curSet(curA, { x: 1500, y: 980 }, 10.8);
  curMove(curA, { x: 1300, y: 860 }, 11.05, 0.35);
  click(curA, 11.42);
  tl.to('#drag-pdf', { scale: 0.92, duration: 0.15 }, 11.42);
  const pdfTo = { x: zone.x - 75 - 1220, y: zone.y - 95 - 760 };
  tl.to('#drag-pdf', { x: pdfTo.x, y: pdfTo.y, rotation: -4, duration: 0.85, ease: 'power2.inOut' }, 11.55);
  curMove(curA, { x: zone.x + 5, y: zone.y + 5 }, 11.55, 0.85);
  tl.to('#drag-pdf', { scale: 0.3, opacity: 0, duration: 0.22, ease: 'power2.in' }, 12.4);
  tl.fromTo($('.attach-chip', winA), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }, 12.45);
  curMove(curA, { x: zone.x + 260, y: zone.y + 220 }, 12.6, 0.7);
  tl.to(rigA, { y: 300, x: -40, scale: 0.94, duration: 0.6, ease: 'power3.inOut' }, 13.0);
  reveal($$('#s3c-cap .w'), 13.15, { st: 0.12, blur: 14, y: 10 });
  tl.to('#s3c-cap', { y: -30, opacity: 0, filter: 'blur(10px)', duration: 0.3, ease: 'power2.in' }, 13.98);
  tl.to('#s3c-cam', { scale: 3.2, transformOrigin: '22% 42%', filter: 'blur(9px)', duration: 0.42, ease: 'power3.in' }, 13.98);

  /* ===== S4 · AI EXTRACTION  14.4 – 19.8 ===== */
  scene('s4', 14.4, 19.85);
  tl.fromTo('#s4-doc', { scale: 0.06, rotationY: 50, rotationX: 14, opacity: 0 },
    { scale: 0.42, rotationY: -12, rotationX: 5, opacity: 1, duration: 0.6, ease: 'back.out(1.3)' }, 14.42);
  tl.to('#s4-doc', { rotationY: 10, rotationX: 2, duration: 1.5, ease: 'sine.inOut' }, 15.02);
  reveal($$('#s4-l .w'), 14.72, { st: 0.15, blur: 16, y: 0, x: -20 });
  reveal($$('#s4-r .w'), 15.05, { st: 0.14, blur: 16, y: 0, x: 20 });
  blurOut(['#s4-l', '#s4-r'], 16.45, 0.28);
  tl.to('#s4-doc', { scale: 0.97, rotationY: 0, rotationX: 0, duration: 0.55, ease: 'power3.inOut' }, 16.45);
  const br = { tl: [-60, -60], tr: [60, -60], bl: [-60, 60], br: [60, 60] };
  $$('#s4-doc .bracket').forEach(b => {
    const [dx, dy] = br[b.dataset.b];
    tl.fromTo(b, { opacity: 0, x: dx, y: dy }, { opacity: 1, x: 0, y: 0, duration: 0.35, ease: 'back.out(2)' }, 16.9);
  });
  tl.fromTo('#s4-doc .scan-tint', { height: '0%', opacity: 1 }, { height: '100%', duration: 0.75, ease: 'power1.inOut' }, 17.2);
  tl.fromTo('#s4-doc .scan-line', { top: 0, opacity: 1 }, { top: 996, duration: 0.75, ease: 'power1.inOut' }, 17.2);
  tl.to(['#s4-doc .scan-tint', '#s4-doc .scan-line'], { opacity: 0, duration: 0.3 }, 17.95);
  tl.fromTo($$('#s4-doc .hl-box'), { opacity: 0, scale: 1.25 }, { opacity: 1, scale: 1, duration: 0.3, stagger: 0.14, ease: 'back.out(2)' }, 18.0);
  tl.to('#s4-doc', { scale: 0.85, filter: 'blur(18px)', opacity: 0, duration: 0.4, ease: 'power2.in' }, 19.4);

  /* ===== S5 · SECONDS LATER → EMAIL  19.8 – 23.4 ===== */
  scene('s5', 19.85, 23.8);
  tl.fromTo('#s5-later', { '--p': 0, y: 14 }, { '--p': 118, y: 0, duration: 0.75, ease: 'power1.inOut' }, 19.95);
  tl.to('#s5-later', { y: -12, duration: 0.4, ease: 'none' }, 20.6);
  tl.set('#s5-later', { opacity: 0 }, 21.0);
  const winB = $('#mailB');
  const card = $('.mail-card', winB), btn = $('.review-btn', winB);
  const btnP = centerIn(btn, winB);
  tl.set('#s5-rig', { opacity: 0 }, 19.85);
  tl.fromTo('#s5-rig', { y: 680, rotationX: 46, rotationY: -8, rotationZ: 7, opacity: 0 },
    { y: 50, rotationX: 18, rotationY: -12, rotationZ: 3, opacity: 1, duration: 0.65, ease: 'expo.out', immediateRender: false }, 21.0);
  const cardP = centerIn(card, winB);
  tl.to('#s5-cam', { scale: 1.75, x: 960 - (120 + cardP.x), y: 540 - (170 + cardP.y),
    transformOrigin: `${120 + cardP.x}px ${170 + cardP.y}px`, duration: 1.0, ease: 'power3.inOut' }, 21.6);
  tl.to('#s5-rig', { rotationX: 8, rotationY: -5, rotationZ: 1.5, duration: 1.0, ease: 'power3.inOut' }, 21.6);
  const curB = $('#curB');
  curSet(curB, { x: btnP.x + 330, y: btnP.y + 260 }, 21.0);
  curMove(curB, { x: btnP.x + 30, y: btnP.y + 8 }, 22.15, 0.6);
  click(curB, 22.8);
  press(btn, 22.8);

  /* ===== S6 · SPARKLE MASK → "TIME FOR A QUICK ✦ CHECK"  23.2 – 27.0 ===== */
  scene('s6', 23.2, 30.0);
  tl.fromTo('#s6', { '--ms': 0 }, { '--ms': 9000, duration: 0.6, ease: 'power2.in' }, 23.2);
  tl.set('#star-ring', { opacity: 1 }, 23.2);
  tl.fromTo('#star-ring', { width: 0, height: 0 }, { width: 9000, height: 9000, duration: 0.6, ease: 'power2.in' }, 23.2);
  tl.to('#star-ring', { opacity: 0, duration: 0.2 }, 23.62);
  const text = $('#s6-text');
  const slot = $('.spark-slot', text);
  const sc = { x: centerIn(slot, text).x, y: centerIn(text.querySelectorAll('.w')[5], text).y + 4 };
  const PAN = 150;
  const home = { x: 960 - PAN - posIn(text, $('#s6')).x, y: 540 - posIn(text, $('#s6')).y };
  tl.set('#s6-line', { x: PAN }, 23.2);
  const sp = $('#s6-spark');
  // motion trail: ghost copies that follow the same path a few frames late
  const trail = $('#s6-trail');
  trail.innerHTML = [0.32, 0.2, 0.12, 0.06].map(o => `<div class="ghost" style="position:absolute;left:0;top:0;width:300px;height:300px;opacity:${o}">${spark3d(300)}</div>`).join('');
  const path = (el, lag, extra = {}) => {
    tl.fromTo(el, { x: home.x - 150, y: home.y - 150, scale: 1.25, rotation: -30 },
      { x: home.x - 150 - 40, y: home.y - 150 + 20, scale: 0.55, rotation: 12, duration: 0.7, ease: 'power3.out', ...extra }, 23.4 + lag);
    tl.to(el, { x: home.x - 150 + 360, y: home.y - 150 - 250, scale: 0.34, rotation: 160, duration: 0.55, ease: 'power2.in' }, 24.1 + lag);
    tl.to(el, { x: sc.x - 150, y: sc.y - 150, scale: 0.27, rotation: 360, duration: 0.85, ease: 'power3.out' }, 24.65 + lag);
  };
  path(sp, 0);
  $$('.ghost', trail).forEach((g, i) => { path(g, 0.035 * (i + 1)); tl.to(g, { opacity: 0, duration: 0.25 }, 25.2); });
  tl.set(trail, { opacity: 0 }, 23.2).set(trail, { opacity: 1 }, 24.1);
  const qw = $$('#s6-text .w:not(.spark-slot)');
  reveal(qw.slice(0, 4), 25.0, { st: 0.14, blur: 14, y: 0, x: 24 });
  reveal(qw.slice(4), 25.62, { blur: 14, y: 0, x: 24 });
  tl.to('#s6-line', { x: -PAN, duration: 2.0, ease: 'none' }, 25.0);
  tl.to('#s6-text', { x: -520, opacity: 0, filter: 'blur(14px)', duration: 0.45, ease: 'power2.in' }, 26.75);

  /* ===== S7 · DASHBOARD → ISOLATED ROW  26.85 – 30.0 ===== */
  scene('s7', 26.85, 30.0);
  const dash = $('#dash');
  const draftDash = centerIn($('#dash-row1 .badge', dash), dash);
  tl.fromTo('#s7-rig', { x: 760, y: 640, rotationX: 38, rotationY: -28, rotationZ: 12, opacity: 0 },
    { x: 0, y: 40, rotationX: 18, rotationY: -16, rotationZ: 5, opacity: 1, duration: 0.7, ease: 'expo.out' }, 26.85);
  tl.to('#s7-rig', { x: -40, y: 20, rotationY: -11, duration: 0.8, ease: 'sine.inOut' }, 27.55);
  const curC = $('#curC');
  curSet(curC, { x: draftDash.x + 380, y: draftDash.y + 420 }, 26.85);
  curMove(curC, { x: draftDash.x + 10, y: draftDash.y + 10 }, 27.45, 0.65);
  tl.to(dash, { filter: 'blur(12px)', opacity: 0, duration: 0.5, ease: 'power2.inOut' }, 28.2);
  tl.to(curC, { opacity: 0, duration: 0.15 }, 28.2);
  tl.fromTo('#iso-row', { opacity: 0, scale: 0.72, x: -40, y: -150, rotation: 4 }, { opacity: 1, duration: 0.18, ease: 'none' }, 28.2);
  tl.to('#iso-row', { scale: 1.25, x: 0, y: 0, rotation: 0, duration: 0.55, ease: 'power3.out' }, 28.2);
  const isoDraft = $('#iso-draft');
  const iso = $('#iso-row');
  const dP = posIn(isoDraft, iso);
  const dx = (dP.x + isoDraft.offsetWidth / 2 - 620) * 1.25 + 960, dy = (dP.y + isoDraft.offsetHeight / 2 - 60) * 1.25 + 540;
  const curD = $('#curD');
  tl.set(curD, { opacity: 0 }, 26.85);
  curSet(curD, { x: dx + 230, y: dy + 200 }, 28.3);
  tl.to(curD, { opacity: 1, duration: 0.15 }, 28.4);
  curMove(curD, { x: dx + 6, y: dy + 8 }, 28.45, 0.5);
  click(curD, 29.05);
  press(isoDraft, 29.05, 0.88);
  tl.set('#iris', { opacity: 1, '--r': 1700 }, 29.45);
  tl.to('#iris', { '--r': 0, duration: 0.5, ease: 'power2.in' }, 29.45);

  /* ===== S8 · VOUCHER FORM  30.0 – 35.4 ===== */
  scene('s8', 30.0, 35.4);
  tl.to('#iris', { '--r': 1700, opacity: 0, duration: 0.45, ease: 'power2.out' }, 30.0);
  const fc = $('#form-card');
  // selection highlight blocks in segmented controls
  [['#seg-post', 1], ['#seg-pay', 1], ['#seg-cat', 1]].forEach(([s, init]) => {
    $$(s + ' > div').forEach((o, i) => { const d = document.createElement('div'); d.className = 'sel'; o.prepend(d); tl.set(d, { opacity: i === init ? 1 : 0 }, 0); });
  });
  const opt = (s, i) => $$(s + ' > div')[i];
  const rig8 = '#s8-rig';
  // zoom to the "Send for approval" button: measure where it lands on screen at that moment
  const ab = $('#approve-btn');
  gsap.set(rig8, { scale: 1, y: -470, rotationX: 14, rotationY: 8, rotationZ: -4 });
  const r = ab.getBoundingClientRect(), sr = $('#stage').getBoundingClientRect();
  const bx = r.left + r.width / 2 - sr.left, by = r.top + r.height / 2 - sr.top;
  gsap.set(rig8, { clearProps: 'transform' });
  tl.fromTo(rig8, { scale: 0.82, y: 360, rotationX: 22, rotationY: 16, rotationZ: -6, opacity: 0 },
    { scale: 1, y: 120, rotationX: 14, rotationY: 12, rotationZ: -4, opacity: 1, duration: 0.6, ease: 'expo.out' }, 30.0);
  tl.to(rig8, { y: -470, rotationY: 8, duration: 3.0, ease: 'sine.inOut' }, 30.45);
  const curE = $('#curE');
  const pPost = centerIn(opt('#seg-post', 0), fc), pPay = centerIn(opt('#seg-pay', 0), fc), pCat = centerIn(opt('#seg-cat', 0), fc);
  curSet(curE, { x: pPost.x + 300, y: pPost.y - 260 }, 30.0);
  const pick = (s, p, tMove, tClick) => {
    curMove(curE, { x: p.x + 20, y: p.y + 6 }, tMove, tClick - tMove - 0.08);
    click(curE, tClick);
    const o = $$(s + ' > div');
    tl.to($('.sel', o[1]), { opacity: 0, duration: 0.2 }, tClick + 0.04);
    tl.fromTo($('.sel', o[0]), { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2)', immediateRender: false }, tClick + 0.04);
  };
  pick('#seg-post', pPost, 30.6, 31.2);
  pick('#seg-pay', pPay, 31.45, 32.05);
  pick('#seg-cat', pCat, 32.3, 32.9);
  tl.to('#s8-cam', { scale: 2.0, x: (960 - bx) * 0.9, y: (560 - by) * 0.9, transformOrigin: `${bx}px ${by}px`, duration: 0.6, ease: 'power3.inOut' }, 33.55);
  const abP = centerIn(ab, fc);
  curMove(curE, { x: abP.x + 40, y: abP.y + 14 }, 33.55, 0.7);
  tl.fromTo($('.shine', ab), { left: -160 }, { left: 520, duration: 0.55, ease: 'power2.inOut' }, 34.0);
  click(curE, 34.35);
  press(ab, 34.35, 0.94);
  blurOut('#s8-cam', 35.05, 0.32, { scale: 1 });

  /* ===== S9 · APPROVERS → APPROVED → POSTED  35.3 – 40.2 ===== */
  scene('s9', 35.3, 41.0);
  tl.fromTo('#ap-head', { y: -70, opacity: 0, filter: 'blur(10px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.4 }, 35.35);
  tl.fromTo('#ap-r1', { y: 220, opacity: 0 }, { y: 120, opacity: 1, duration: 0.4 }, 35.5);
  tl.fromTo('#ap-r1 .ok', { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(3)' }, 35.8);
  tl.fromTo('#ap-r2', { y: 330, opacity: 0 }, { y: 252, opacity: 0.72, duration: 0.4 }, 35.72);
  tl.set('#ap-r2 .spin', { opacity: 1 }, 35.9);
  tl.fromTo('#ap-r2 .spin', { rotation: 0 }, { rotation: 760, duration: 0.7, ease: 'none' }, 35.9);
  tl.set('#ap-r2 .spin', { opacity: 0 }, 36.6);
  tl.fromTo('#ap-r2 .ok', { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(3)' }, 36.6);
  tl.to('#ap-r2', { opacity: 1, duration: 0.2 }, 36.6);
  // collapse into a pill
  tl.to(['#ap-head', '#ap-r1', '#ap-r2'], { y: 120, scaleY: 0.5, opacity: 0, duration: 0.25, ease: 'power2.in' }, 37.15);
  tl.fromTo('#ap-box', { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.2, ease: 'power2.out' }, 37.2);
  tl.to('#ap-box', { width: 660, height: 132, borderRadius: 66, duration: 0.4, ease: 'power3.inOut' }, 37.38);
  tl.to(['#ap-fill', '#ap-gloss'], { opacity: 1, duration: 0.3 }, 37.42);
  tl.set('#ap-txt', { opacity: 1 }, 37.52);
  const at = $$('#ap-txt .w');
  tl.fromTo(at[0], { y: -18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35 }, 37.52);
  tl.fromTo(at[1], { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45 }, 37.58);
  tl.to('#ap-txt', { opacity: 0, duration: 0.15 }, 38.25);
  tl.to('#ap-box', { width: 190, height: 190, borderRadius: 95, duration: 0.3, ease: 'power3.in' }, 38.25);
  tl.to('#ap-box', { opacity: 0, scale: 0.9, duration: 0.15 }, 38.5);
  tl.fromTo('#ok-ring', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.55, ease: 'power2.inOut' }, 38.48);
  tl.fromTo('#ok-wrap', { rotation: -40, scale: 0.92 }, { rotation: 0, scale: 1, duration: 0.6, ease: 'power3.out' }, 38.48);
  tl.fromTo('#ok-check', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.3, ease: 'power2.out' }, 38.98);
  tl.to('#ok-wrap', { y: -70, duration: 0.4, ease: 'power3.inOut' }, 39.2);
  tl.fromTo('#ok-txt', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.4 }, 39.3);
  // shrink the dark world into a card, then fling it away
  tl.to('#s9-shrink', { clipPath: 'inset(150px 770px 150px 770px round 30px)', duration: 0.38, ease: 'power3.inOut' }, 40.15);
  tl.to('#s9-content', { scale: 0.42, duration: 0.38, ease: 'power3.inOut' }, 40.15);
  tl.to('#s9-shrink', { rotationX: -62, y: -1150, scaleX: 0.72, transformPerspective: 1300, filter: 'blur(5px)', duration: 0.38, ease: 'power2.in' }, 40.58);

  /* ===== S11 · BENEFITS  40.15 – 44.4 ===== */
  scene('s11', 40.1, 44.45);
  reveal($$('#s11-save .w'), 40.72, { st: 0.15, blur: 18, y: 0, x: 18 });
  tl.to('#s11-save', { scale: 0.38, filter: 'blur(10px)', opacity: 0, duration: 0.3, ease: 'power2.in' }, 42.05);
  tl.to('#s11-bg2', { opacity: 1, duration: 0.5 }, 42.1);
  const cw = $$('#s11-ctrl .w');
  tl.fromTo(cw[0], { opacity: 0, scale: 1.6, filter: 'blur(22px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.4 }, 42.32);
  reveal(cw.slice(1), 42.8, { st: 0.15, blur: 14, y: 0, x: 16 });
  $$('#s11-stars .s11-star').forEach((g, i) => {
    tl.fromTo($('path', g), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.95, ease: 'power2.out' }, 42.35 + i * 0.12);
    tl.fromTo(g, { rotation: 0, scale: 1.18 }, { rotation: [34, -26, 18][i], scale: 0.86, duration: 2.1, ease: 'sine.out' }, 42.35);
  });
  tl.fromTo('#s11-ctrl', { scale: 1 }, { scale: 0.93, duration: 1.2, ease: 'sine.inOut' }, 43.1);
  blurOut(['#s11-ctrl', '#s11-stars'], 44.12, 0.3);

  /* ===== S12 · END CARD  44.35 – 48.0 ===== */
  scene('s12', 44.35, null);
  tl.fromTo('#s12-logo', { opacity: 0, scale: 0.4, filter: 'blur(22px)', rotation: -12 }, { opacity: 1, scale: 1, filter: 'blur(0px)', rotation: 0, duration: 0.55, ease: 'expo.out' }, 44.38);
  tl.fromTo('#s12-logo .vq-arrow', { x: -170, y: 170, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.45, ease: 'back.out(2)' }, 44.6);
  tl.to('#s12-logo', { x: -365, duration: 0.5, ease: 'power3.inOut' }, 44.92);
  tl.fromTo('#s12-word', { '--p': 0, x: -30 }, { '--p': 115, x: 0, duration: 0.65, ease: 'power2.out' }, 45.0);
  tl.fromTo('#s12-url', { opacity: 0, scale: 0.2 }, { opacity: 1, scale: 1, duration: 0.18, ease: 'power2.out' }, 45.45);
  tl.fromTo('#s12-url', { width: 78 }, { width: 380, duration: 0.42, ease: 'power3.out' }, 45.62);
  tl.to('#s12-urltxt', { opacity: 1, duration: 0.25 }, 45.82);
  tl.fromTo('#s12-wrap', { scale: 1 }, { scale: 1.035, duration: 2.0, ease: 'none' }, 46.0);

  tl.set({}, {}, DURATION);
}

/* ---------------------------------------------------------------- */
(async () => {
  const params = new URLSearchParams(location.search);
  const render = params.has('render');
  if (render) document.body.classList.add('render');
  await buildDOM();
  await Promise.all([
    '300 100px "Plus Jakarta Sans Variable"', '400 100px "Plus Jakarta Sans Variable"', '800 100px "Plus Jakarta Sans Variable"',
    '400 20px "Inter Variable"', '700 20px "Inter Variable"',
  ].map(f => document.fonts.load(f, 'Vyapar ₹1')));
  await document.fonts.ready;
  buildTimeline();
  window.__seek = t => { tl.seek(Math.min(t, DURATION - 0.0001)); return true; };
  window.__duration = DURATION;
  window.__ready = true;
  if (params.has('t')) tl.seek(+params.get('t'));
  if (render) return;

  /* ---- interactive preview ---- */
  const stage = $('#stage'), audio = $('#audio'), scrub = $('#scrub'), time = $('#time');
  const fit = () => { const s = Math.min(innerWidth / 1920, (innerHeight - 50) / 1080); stage.style.transform = `scale(${s})`; };
  fit(); addEventListener('resize', fit);
  let playing = false;
  const loop = () => { if (!playing) return; const t = audio.currentTime; tl.seek(t); scrub.value = t; time.textContent = t.toFixed(2) + 's';
    if (t >= DURATION - 0.05) playing = false; requestAnimationFrame(loop); };
  $('#play').onclick = () => { if (playing) { audio.pause(); playing = false; return; } audio.currentTime = +scrub.value; audio.play(); playing = true; loop(); };
  scrub.oninput = () => { tl.seek(+scrub.value); time.textContent = (+scrub.value).toFixed(2) + 's'; if (playing) audio.currentTime = +scrub.value; };
})();
