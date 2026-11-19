/* VyaparIQ for RSPSDC — Act 3. Deterministic timeline: seek(t) renders any instant. */
const T = 50, FPS = 30;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* cue times (seconds, video clock) taken from the voiceover word timings */
const C = {
  hub: 0.3, name: 1.4, chip: 3.2, lead: 5.25, head: 5.55, five: 6.3, trans: 8.3,
  s: [9.11, 15.38, 24.24, 31.63, 39.96],   // "First" … "And fifth"
  e: [15.25, 24.1, 31.5, 39.8, 47.8],
  out: 47.9,
};
const AC = ['#22D3EE', '#34D399', '#FBBF24', '#A78BFA', '#FB7185'];
const TOOLS = [
  ['Live Tally Sync', 'Real-time ledger & grant visibility'],
  ['WhatsApp Reminders', 'Automated partner & payment follow-ups'],
  ['Daily Pulse & Compliance', 'Morning cash & regulatory alerts'],
  ['AI Chatbot', 'Instant answers from live data'],
  ['Task Management', 'Team accountability & closure tracking'],
];
const svg = (p, s = 28) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const ICP = [
  '<path d="M20 12a8 8 0 0 0-14.3-4.9"/><path d="M5 3v4.5h4.5"/><path d="M4 12a8 8 0 0 0 14.3 4.9"/><path d="M19 21v-4.5h-4.5"/>',
  '<path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.7-5A8.5 8.5 0 1 1 21 11.5z"/><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" stroke-width="2.6"/>',
  '<path d="M2 12h4l2.5-7 4.5 14 3-9 1.5 2H22"/>',
  '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.7 1.8 1.8.7-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7z"/>',
  '<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M8 12.3l2.8 2.8L16.2 9.5"/>',
];
const CHECK = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

/* ───────── timeline engine ───────── */
const anims = [], ups = [];
const EASE = 'cubic-bezier(.2,.8,.2,1)';
function els(t) { return typeof t === 'string' ? $$(t) : (t instanceof Element ? [t] : [...t]); }
/* K(target, cssProp, [[time, value, easingIntoThisPoint?], …]) — value holds before first / after last point */
function K(target, prop, pts, ease = EASE) {
  pts = pts.slice().sort((a, b) => a[0] - b[0]);
  const kf = [];
  if (pts[0][0] > 0) kf.push({ offset: 0, [prop]: pts[0][1] });
  pts.forEach((p, i) => kf.push({ offset: Math.max(0, Math.min(1, p[0] / T)), [prop]: p[1], easing: (pts[i + 1] && pts[i + 1][2]) || ease }));
  if (pts[pts.length - 1][0] < T) kf.push({ offset: 1, [prop]: pts[pts.length - 1][1] });
  els(target).forEach(el => { const a = el.animate(kf, { duration: T * 1000, fill: 'both' }); a.pause(); anims.push(a); });
}
function show(target, t, o = {}) {
  const { dx = 0, dy = 22, dur = 0.55, out = null, s0 = null } = o;
  const op = [[t, 0], [t + dur * 0.7, 1]];
  if (out != null) op.push([out, 1], [out + 0.3, 0]);
  K(target, 'opacity', op);
  if (dx || dy) K(target, 'translate', [[t, `${dx}px ${dy}px`], [t + dur, '0px 0px']]);
  if (s0 != null) K(target, 'scale', [[t, String(s0)], [t + dur, '1', 'cubic-bezier(.2,1.5,.4,1)']]);
}
const swap = (a, b, t) => { K(a, 'opacity', [[t, 1], [t + 0.2, 0]]); show(b, t + 0.05, { dy: 8, dur: 0.35 }); };
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const eo = x => 1 - Math.pow(1 - clamp(x), 3);
const count = (el, t0, t1, to, fmt) => ups.push(t => { el.textContent = fmt(to * eo((t - t0) / (t1 - t0))); });

/* ───────── build: headline, cards, rail, feeds, spokes ───────── */
$('#headC').innerHTML = ['WHAT', 'RSPSDC', 'GETS', 'WITH', 'VYAPARIQ'].map((w, i) => `<span class="${i === 4 ? 'g' : ''}">${w}</span>`).join('');
const cardsEl = $('#cards'), feedsEl = $('#feeds'), railEl = $('#rail'), spokes = $('#spokes');
const IX = i => 150 + i * 330, IY = 660, IW = 300, IH = 200;       // intro row
const MX = 70, MY = i => 262 + i * 147, MW = 570, MH = 132;          // docked stack
TOOLS.forEach(([title, sub], i) => {
  const c = document.createElement('div');
  c.className = 'card'; c.style.setProperty('--ac', AC[i]);
  c.innerHTML = `<div class="glow"></div><div class="ic">${svg(ICP[i], 30)}</div><div class="no">0${i + 1}</div><div class="ck">${CHECK}</div>
    <div class="tt">${title.replace('&', '&amp;')}</div><div class="sub">${sub.replace('&', '&amp;').split(' ').map(w => `<span>${w}</span>`).join('')}</div><div class="pb"></div>`;
  cardsEl.appendChild(c);
  const f = document.createElement('div'); f.className = 'feed'; f.style.setProperty('--ac', AC[i]); f.style.top = (MY(i) + MH / 2 - 1) + 'px'; f.innerHTML = '<i></i>';
  feedsEl.appendChild(f);
  const r = document.createElement('div'); r.className = 'rb'; r.style.setProperty('--ac', AC[i]);
  r.innerHTML = `${svg(ICP[i], 24)}<div class="done">${svg(ICP[i], 24)}</div><div class="on">${svg(ICP[i], 24)}</div>`;
  railEl.appendChild(r);
  const cx = IX(i) + IW / 2;
  spokes.insertAdjacentHTML('beforeend', `<path d="M960 540 C960 ${600} ${cx} ${590} ${cx} ${IY - 4}" stroke="${AC[i]}" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" opacity=".7"/>`);
});
$$('.micon[data-ic]').forEach(m => m.innerHTML = svg(ICP[+m.dataset.ic], 26));

/* ───────── intro ───────── */
K('#hub', 'opacity', [[C.hub, 0], [C.hub + 0.4, 1]]);
K('#hub', 'scale', [[C.hub, '0.5'], [C.hub + 0.8, '1', 'cubic-bezier(.2,1.4,.4,1)']]);
$$('.ring').forEach((r, i) => {
  const pts = [], ops = [];
  for (let k = 0; k < 5; k++) { const t0 = 0.7 + i * 0.55 + k * 1.7; pts.push([t0, '1'], [t0 + 1.65, '3.6', 'ease-out']); ops.push([t0, 0.55], [t0 + 1.65, 0, 'ease-out']); }
  K(r, 'scale', pts); K(r, 'opacity', [[0, 0], ...ops, [C.trans, 0]]);
});
show('#wordmark', C.name, { dy: 26 });
show('#forChip', C.chip, { dy: 16, out: C.lead - 0.15 });
K('#hubGroup', 'translate', [[C.lead, '0px 0px'], [C.lead + 0.8, '0px -70px'], [C.trans, '0px -70px'], [C.trans + 0.5, '0px -110px', 'ease-in']]);
K('#hubGroup', 'scale', [[C.lead, '1'], [C.lead + 0.8, '0.72'], [C.trans, '0.72'], [C.trans + 0.5, '0.6', 'ease-in']]);
K('#hubGroup', 'opacity', [[C.trans, 1], [C.trans + 0.4, 0]]);
$$('#headC span').forEach((w, i) => { show(w, C.head + i * 0.13, { dy: 34, dur: 0.6, out: C.trans - 0.05 }); });
$$('#spokes path').forEach((p, i) => {
  K(p, 'strokeDashoffset', [[C.five - 0.1 + i * 0.14, 100], [C.five + 0.55 + i * 0.14, 0]]);
  K(p, 'opacity', [[C.trans - 0.1, 0.7], [C.trans + 0.2, 0]]);
});

/* ───────── cards: fan out → dock → activate one by one ───────── */
$$('.card').forEach((c, i) => {
  const t0 = C.five + i * 0.14, tm = C.trans + i * 0.05, s = C.s[i], e = C.e[i], D = 0.8;
  const cx = IX(i) + IW / 2, cy = IY + IH / 2;
  K(c, 'translate', [[t0, `${960 - cx}px ${420 - cy}px`], [t0 + 0.7, '0px 0px']]);
  K(c, 'scale', [[t0, '0.25'], [t0 + 0.7, '1']]);
  K(c, 'left', [[tm, IX(i) + 'px'], [tm + D, MX + 'px']]);
  K(c, 'top', [[tm, IY + 'px'], [tm + D, MY(i) + 'px']]);
  K(c, 'width', [[tm, IW + 'px'], [tm + D, MW + 'px']]);
  K(c, 'height', [[tm, IH + 'px'], [tm + D, MH + 'px']]);
  K($('.ic', c), 'left', [[tm, '24px'], [tm + D, '22px']]); K($('.ic', c), 'top', [[tm, '24px'], [tm + D, '36px']]);
  K($('.tt', c), 'left', [[tm, '24px'], [tm + D, '104px']]); K($('.tt', c), 'top', [[tm, '106px'], [tm + D, '33px']]);
  K($('.tt', c), 'width', [[tm, '252px'], [tm + D, '440px']]);
  const op = [[t0, 0], [t0 + 0.35, 1]];
  if (i > 0) op.push([tm + 0.3, 1], [tm + D, 0.5], [s - 0.1, 0.5], [s + 0.25, 1]);
  op.push([e, 1], [e + 0.4, 0.8], [C.out + 0.1 + i * 0.07, 0.8], [C.out + 0.5 + i * 0.07, 1]);
  K(c, 'opacity', op);
  K($('.glow', c), 'opacity', [[s - 0.05, 0], [s + 0.35, 1], [e, 1], [e + 0.35, 0], [C.out + 0.1 + i * 0.07, 0], [C.out + 0.55 + i * 0.07, 0.75]]);
  $$('.sub span', c).forEach((w, j) => show(w, s + 0.5 + j * 0.075, { dy: 12, dur: 0.4 }));
  K($('.no', c), 'opacity', [[e, 1], [e + 0.2, 0]]);
  show($('.ck', c), e + 0.1, { dy: 0, s0: 0.3, dur: 0.45 });
  K($('.pb', c), 'scale', [[s, '0 1'], [e, '1 1', 'linear']]);
  K($('.pb', c), 'opacity', [[s, 0], [s + 0.1, 1], [e, 1], [e + 0.4, 0.4]]);
  const f = $$('.feed')[i];
  K(f, 'opacity', [[s + 0.3, 0], [s + 0.6, 1], [e - 0.1, 1], [e + 0.2, 0]]);
  ups.push(t => { $('i', f).style.left = (((t * 80) % 70) - 18) + 'px'; });
  const rb = $$('.rb')[i];
  K($('.on', rb), 'opacity', [[s, 0], [s + 0.3, 1], [e, 1], [e + 0.3, 0]]);
  K($('.done', rb), 'opacity', [[e, 0], [e + 0.3, 1]]);
});
show('#headL span', C.trans + 0.3, { dx: -30, dy: 0, dur: 0.6 });
K('#dash', 'opacity', [[C.trans + 0.15, 0], [C.trans + 0.7, 1]]);
K('#dash', 'translate', [[C.trans + 0.15, '90px 0px'], [C.trans + 0.95, '0px 0px']]);

/* ───────── modules enter / exit ───────── */
['#m1', '#m2', '#m3', '#m4', '#m5'].forEach((m, i) => {
  const s = C.s[i], e = C.e[i];
  K(m, 'opacity', [[s, 0], [s + 0.4, 1], [e, 1], [e + 0.22, 0]]);
  K(m, 'translate', [[s, '0px 20px'], [s + 0.55, '0px 0px'], [e, '0px 0px'], [e + 0.22, '0px -14px', 'ease-in']]);
});
K('#m6', 'opacity', [[C.out, 0], [C.out + 0.4, 1]]);

/* ── 1 · Live Tally Sync ── */
{
  const rows = [['CSR Grant · Tranche 2', 'Receipt · Vch 1182', '+ ₹ 48,00,000', 'cr'], ['Partner payout', 'Payment · Vch 1183', '− ₹ 6,25,000', 'dr'],
    ['Programme fee', 'Receipt · Vch 1184', '+ ₹ 3,40,000', 'cr'], ['TDS payable', 'Journal · Vch 1185', '₹ 62,500', ''], ['Centre operations', 'Payment · Vch 1186', '− ₹ 2,18,000', 'dr']];
  $('#ledger').innerHTML = rows.map(r => `<div class="lrow"><div class="ld"><b>${r[0]}</b><span>${r[1]}</span></div><div class="am ${r[3]}">${r[2]}</div></div>`).join('');
  $$('.lrow').forEach((r, i) => show(r, 9.7 + i * 0.32, { dx: -18, dy: 0, dur: 0.45 }));
  show('#beam', 11.2, { dy: 0 });
  $$('#beam .track').forEach((tr, k) => $$('i', tr).forEach((d, j) => ups.push(t => { d.style.left = (((t * 62 + j * 30 + k * 11) % 90) - 18) + 'px'; })));
  ups.push(t => { $('.syncdot svg').style.transform = `rotate(${(t * 200) % 360}deg)`; });
  $$('#m1 .kpi').forEach((k, i) => show(k, 11.7 + i * 0.16, { dy: 18 }));
  count($('#k1'), 12.3, 13.7, 3.42, v => `₹ ${v.toFixed(2)} Cr`);
  count($('#k2'), 12.45, 13.85, 1.86, v => `₹ ${v.toFixed(2)} Cr`);
  count($('#k3'), 12.6, 14.0, 72, v => `${Math.round(v)}%`);
  show('#m1chart', 12.5, { dy: 18 });
  ups.push(t => {
    $('#acliprect').setAttribute('width', 490 * eo((t - 12.9) / 1.6));
    const on = clamp((t - 14.3) / 0.25), ph = (t * 0.9) % 1;
    $('#livedot').setAttribute('opacity', on);
    $('#livehalo').setAttribute('r', 7 + ph * 16); $('#livehalo').setAttribute('opacity', on * (1 - ph));
  });
  show('#m1live', 13.5, { dx: 16, dy: 0 });
}

/* ── 2 · WhatsApp Reminders ── */
{
  ['#fu1', '#fu2', '#fu3'].forEach((f, i) => show(f, 15.8 + i * 0.18, { dy: 18 }));
  show('#m2rule', 16.3, { dx: 16, dy: 0 });
  $$('#m2 .chip.sent, #m2 .chip.ok, #zero, #m2 .bub').forEach(x => x.style.opacity = 0);
  const sendT = [19.45, 20.45, 21.95];
  sendT.forEach((t, i) => {
    const fu = $(`#fu${i + 1}`), b = $(`#b${i + 1}`);
    b.style.transformOrigin = '100% 100%';
    show(b, t, { dy: 16, s0: 0.86, dur: 0.45 });
    swap($('.wait', fu), $('.sent', fu), t + 0.25);
    K(fu, 'borderColor', [[t, 'rgba(255,255,255,.08)'], [t + 0.25, 'rgba(52,211,153,.75)'], [t + 1.2, 'rgba(52,211,153,.28)']]);
  });
  show('#zero', 22.85, { dy: 14, s0: 0.92, dur: 0.5 });
  $('#b4').style.transformOrigin = '0% 100%';
  show('#b4', 23.1, { dy: 16, s0: 0.86, dur: 0.45 });
  swap($('#fu1 .sent'), $('#fu1 .ok'), 23.4);
}

/* ── 3 · Daily Pulse & Compliance ── */
{
  show('#m3 .every', 25.9, { dx: 14, dy: 0 });
  show('#m3del', 25.6, { dx: 16, dy: 0 });
  ['#p1', '#p2', '#p3'].forEach((p, i) => show(p, 24.9 + i * 0.14, { dy: 20 }));
  show('#p1 .big, #p1 small, #p1 .spark', 26.7, { dy: 12 });
  $$('#p1 .kv').forEach((k, i) => show(k, 27.0 + i * 0.12, { dy: 10 }));
  count($('#cashbig'), 26.8, 27.8, 3.42, v => `₹ ${v.toFixed(2)} Cr`);
  K('#sparkp', 'strokeDashoffset', [[26.9, 100], [27.9, 0]]);
  $$('#p2 .ms').forEach((m, i) => {
    show(m, 27.75 + i * 0.14, { dy: 12 });
    K($('u', m), 'scale', [[27.9 + i * 0.14, '0 1'], [28.8 + i * 0.14, '1 1']]);
  });
  $$('#p3 .dl').forEach((d, i) => show(d, 29.25 + i * 0.4, { dx: 18, dy: 0, dur: 0.45 }));
  K('#p1', 'borderColor', [[26.7, 'rgba(255,255,255,.08)'], [26.95, 'rgba(251,191,36,.6)'], [27.8, 'rgba(255,255,255,.08)']]);
  K('#p2', 'borderColor', [[27.75, 'rgba(255,255,255,.08)'], [28.0, 'rgba(251,191,36,.6)'], [29.0, 'rgba(255,255,255,.08)']]);
  K('#p3', 'borderColor', [[29.2, 'rgba(255,255,255,.08)'], [29.45, 'rgba(251,191,36,.6)'], [31.0, 'rgba(251,191,36,.3)']]);
}

/* ── 4 · AI Chatbot ── */
{
  const Q = 'Show Q3 CSR utilization & pending compliance', t0 = 32.95, t1 = 35.35, tSend = 35.6, tAns = 36.25;
  $$('#sugg span').forEach((s, i) => show(s, 32.2 + i * 0.1, { dy: 12, out: tSend - 0.1 }));
  K('#ph', 'opacity', [[t0 - 0.1, 1], [t0, 0]]);
  ups.push(t => {
    const n = Math.round(Q.length * clamp((t - t0) / (t1 - t0)));
    $('#typed').textContent = Q.slice(0, n);
    $('#caret').style.opacity = (t > t0 && t < t1) ? 1 : (t >= tSend ? 0 : (Math.floor(t * 2.2) % 2 ? 0.15 : 1));
  });
  K('#send', 'scale', [[tSend - 0.1, '1'], [tSend + 0.05, '0.82'], [tSend + 0.35, '1']]);
  show('#think', tSend + 0.1, { dy: 8, dur: 0.3, out: tAns - 0.2 });
  $$('#think i').forEach((d, i) => ups.push(t => { d.style.opacity = 0.35 + 0.65 * Math.abs(Math.sin(t * 7 - i * 0.8)); }));
  show('#answer', tAns, { dy: 26, dur: 0.6 });
  $$('#bars .bar').forEach((b, i) => {
    K($('i', b), 'scale', [[tAns + 0.2 + i * 0.09, '1 0'], [tAns + 1.0 + i * 0.09, '1 1']]);
    show($('b', b), tAns + 0.75 + i * 0.09, { dy: 10, dur: 0.35 });
  });
  count($('#ansbig'), tAns + 0.3, tAns + 1.3, 78, v => `${Math.round(v)}%`);
  show('.ans2', tAns + 0.9, { dy: 12 });
  show('#bver', 38.05, { dy: 0, s0: 0.7, dur: 0.5 });
  show('#bsec', 39.0, { dy: 0, s0: 0.7, dur: 0.5 });
}

/* ── 5 · Task Management ── */
{
  $$('#m5 .who, #m5 .chip.prog, #m5 .chip.ok').forEach(x => x.style.opacity = 0);
  const closeT = [47.0, 47.14, 47.28];
  ['#t1', '#t2', '#t3'].forEach((id, i) => {
    const r = $(id), tp = i < 2 ? 42.75 + i * 0.12 : 44.0, ta = 45.15 + i * 0.16, tg = 46.3 + i * 0.1, tc = closeT[i];
    show(r, 40.55 + i * 0.22, { dy: 20 });
    K($('.tg', r), 'scale', [[tp, '1'], [tp + 0.18, '1.14'], [tp + 0.5, '1']]);
    K(r, 'borderColor', [[tp, 'rgba(255,255,255,.08)'], [tp + 0.2, 'rgba(251,113,133,.7)'], [tp + 1.1, 'rgba(255,255,255,.08)'], [tc, 'rgba(255,255,255,.08)'], [tc + 0.25, 'rgba(52,211,153,.6)']]);
    K($('.un', r), 'opacity', [[ta, 1], [ta + 0.2, 0]]);
    show($('.who', r), ta + 0.05, { dx: 24, dy: 0, dur: 0.45 });
    swap($('.wait', r), $('.prog', r), tg);
    swap($('.prog', r), $('.ok', r), tc);
    K($('u', r), 'scale', [[ta, '0 1'], [ta + 0.4, '0.33 1'], [tg, '0.33 1'], [tg + 0.4, '0.66 1'], [tc, '0.66 1'], [tc + 0.3, '1 1']]);
  });
  K('#ringc', 'strokeDashoffset', [[closeT[0], 100], [closeT[0] + 0.3, 66.7], [closeT[1], 66.7], [closeT[1] + 0.3, 33.3], [closeT[2], 33.3], [closeT[2] + 0.35, 0]]);
  ups.push(t => {
    const done = closeT.filter(x => t >= x + 0.1).length, prog = [46.3, 46.4, 46.5].filter(x => t >= x + 0.1).length - done;
    $('#ringn').textContent = `${done}/3`; $('#cDone').textContent = done; $('#cProg').textContent = Math.max(0, prog); $('#cOpen').textContent = 3 - done - Math.max(0, prog);
  });
}

/* ── overview ── */
{
  const O = [['₹ 3.42 Cr', 'Cash & bank · synced live'], ['3 sent', '0 manual follow-ups'], ['8:30 AM', '4 deadlines on watch'], ['1.8 s', 'Verified answers from live data'], ['3 of 3', 'Tasks tracked to closure']];
  const pos = [[0, 0, 326], [348, 0, 326], [696, 0, 326], [0, 336, 500], [522, 336, 500]];
  $('#ov').innerHTML = O.map((o, i) => `<div class="ot" style="--ac:${AC[i]};left:${pos[i][0]}px;top:${pos[i][1]}px;width:${pos[i][2]}px;height:314px">
    <div class="oh"><div class="micon">${svg(ICP[i], 24)}</div>${TOOLS[i][0].replace('&', '&amp;')}</div><div class="ov1">${o[0]}</div><div class="ov2">${o[1].replace('&', '&amp;')}</div><div class="ob"></div></div>`).join('');
  $$('.ot').forEach((o, i) => show(o, C.out + 0.15 + i * 0.09, { dy: 26, s0: 0.95 }));
}

/* ambient */
ups.push(t => {
  $('.bg-grid').style.transform = `translate(${-(t * 5) % 64}px, ${-(t * 3) % 64}px)`;
  $('.g1').style.transform = `translate(${Math.sin(t * 0.2) * 60}px, ${Math.cos(t * 0.17) * 40}px)`;
  $('.g2').style.transform = `translate(${Math.cos(t * 0.15) * 70}px, ${Math.sin(t * 0.19) * 40}px)`;
  $$('.blink').forEach(b => { b.style.opacity = 0.45 + 0.55 * Math.abs(Math.sin(t * 3.2)); });
});

function seek(t) { anims.forEach(a => { a.currentTime = t * 1000; }); ups.forEach(u => u(t)); }
window.seek = seek; window.DURATION = T; window.FPS = FPS;
seek(0);
