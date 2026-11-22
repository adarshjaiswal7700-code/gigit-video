/* ---------- VyaparIQ demo video – DOM templates ----------
   All copy for the video lives in COPY so it is easy to edit. */
const COPY = {
  hookA: 'Still using Tally', hookAKey: 'Tally',
  hookB: 'only for accounting??', hookBKey: 'accounting??',
  meet: 'Meet',
  brandA: 'Vyapar', brandB: 'IQ',
  tagline: 'AI-powered accounting assistant',
  send: ['Send', 'one', 'or', 'multiple', 'bills'],
  toEmail: ['to', 'your', 'VyaparIQ', 'email'],
  extractL: ['It', 'extracts'], extractR: ['all', 'key', 'details'],
  later: 'And seconds later',
  quick: ['Time', 'for', 'a', 'quick', '*', 'check'],
  save: ['Save', 'time.', 'Avoid', 'errors.'],
  control: ['Stay', 'in', 'control'],
  url: 'vyapariq.com',
  user: 'Rahul', company: 'Gupta Enterprises', inbox: 'gupta-enterprises@inbox.vyapariq.com',
};

let LOGO_SVG = '';
let logoCount = 0;
function logo(cls = '', style = '') {
  logoCount++;
  return LOGO_SVG.replace('<svg ', `<svg class="${cls}" style="${style}" `)
    .replaceAll('vqArrow', 'vqArrow' + logoCount);
}

const STAR_D = 'M50 0 C54 34 66 46 100 50 C66 54 54 66 50 100 C46 66 34 54 0 50 C34 46 46 34 50 0 Z';
let sparkCount = 0;
function spark(size = 22, cls = 'spark-ico', light = false) {
  sparkCount++;
  const id = 'spk' + sparkCount;
  const a = light ? ['#8f7dff', '#c25cff', '#ff7ad3'] : ['#5b4dff', '#a41cf2', '#ff5fc3'];
  return `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 100 100"><defs><linearGradient id="${id}" x1="0" y1="1" x2="1" y2="0">
    <stop offset="0" stop-color="${a[0]}"/><stop offset=".55" stop-color="${a[1]}"/><stop offset="1" stop-color="${a[2]}"/></linearGradient></defs>
    <path d="${STAR_D}" fill="url(#${id})"/></svg>`;
}
function spark3d(size, cls = '') {
  sparkCount++;
  const id = 'sp3' + sparkCount;
  return `<svg class="${cls}" width="${size}" height="${size}" viewBox="-10 -10 120 120" style="overflow:visible">
   <defs>
    <linearGradient id="${id}a" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#6a5cff"/><stop offset=".5" stop-color="#a63ff5"/><stop offset="1" stop-color="#ff6fcf"/></linearGradient>
    <radialGradient id="${id}b" cx=".38" cy=".32" r=".55"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset=".45" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <linearGradient id="${id}c" x1="1" y1="1" x2=".3" y2=".3"><stop offset="0" stop-color="#2a0a5e" stop-opacity=".45"/><stop offset="1" stop-color="#2a0a5e" stop-opacity="0"/></linearGradient>
   </defs>
   <path d="${STAR_D}" fill="url(#${id}a)"/>
   <path d="${STAR_D}" fill="url(#${id}c)"/>
   <path d="${STAR_D}" fill="url(#${id}b)"/>
  </svg>`;
}

const CURSOR = `<svg viewBox="0 0 23 28" width="46" height="56"><path d="M2.2 1.6 L2.2 22.4 L7.4 17.6 L10.9 25.6 L14.6 24 L11.1 16.1 L18.3 15.8 Z" fill="#14101a" stroke="#fff" stroke-width="1.7" stroke-linejoin="round"/></svg>`;
function cursor(id) { return `<div class="cursor" id="${id}">${CURSOR}<div class="ripple"></div></div>`; }

function words(list, keys = [], cls = 'grad') {
  return list.map(w => w === '*' ? `<span class="w spark-slot" style="width:90px"></span>` :
    `<span class="w ${keys.includes(w) ? cls : ''}">${w}</span>`).join(' ');
}

const ICON = {
  compose: c => `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M13 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8"/><path d="M17 2v6M14 5h6"/></svg>`,
  menu: c => `<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`,
  send: c => `<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.6" stroke-linejoin="round"><path d="M4 4l17 8-17 8 3-8z"/><path d="M7 12h14"/></svg>`,
  check: c => `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12.5l4 4 8-9"/></svg>`,
  cal: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a29db0" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>`,
  pdf: `<div style="width:34px;height:40px;border-radius:6px;background:#fff;border:1.5px solid #e9b4b4;display:flex;align-items:flex-end;justify-content:center;padding-bottom:4px"><b style="font-size:9px;color:#e0473f">PDF</b></div>`,
  dl: c => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>`,
};

/* ---------- invoice (GST tax invoice, fictional supplier) ---------- */
function invoiceHTML(withHL) {
  const H = (inner) => withHL ? `<span class="hlf">${inner}<span class="hl-box"></span></span>` : inner;
  return `<div class="inv">
   <div style="display:flex;justify-content:space-between">
     <div><div class="brand">Sharma Traders</div>
       <div class="muted" style="margin-top:8px">Plot 14, MIDC Bhosari, Pune<br>Maharashtra 411026<br>accounts@sharmatraders.in</div>
       <div style="margin-top:10px">${H('<span class="lbl">GSTIN&nbsp;</span><span class="val">27AAPFS4821K1Z3</span>')}</div></div>
     <div style="text-align:right"><div style="font-size:22px;font-weight:800;letter-spacing:.06em;color:#3a3346">TAX INVOICE</div>
       <div class="muted" style="margin-top:6px">Original for recipient</div></div>
   </div>
   <div style="display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:18px;margin-top:34px">
     <div><div class="lbl">Billed to</div><div class="val">Gupta Enterprises</div><div class="muted">Nashik, Maharashtra<br>GSTIN 27AAKCG7731M1Z8</div></div>
     <div>${H('<div class="lbl">Invoice no.</div><div class="val">ST/25-26/0482</div>')}
       <div style="height:14px"></div>${H('<div class="lbl">Invoice date</div><div class="val">12 Nov 2025</div>')}</div>
     <div style="text-align:right">${H('<div class="lbl">Total (INR)</div><div class="val" style="font-size:26px;color:#7b2ff2">₹1,18,000</div>')}
       <div style="height:14px"></div>${H('<div class="lbl">Due date</div><div class="val">27 Nov 2025</div>')}</div>
   </div>
   <div class="muted" style="margin-top:22px">Place of supply: Maharashtra (27)</div>
   <table style="margin-top:20px">
     <tr><th>Item</th><th>HSN</th><th class="r">Qty</th><th class="r">Rate</th><th class="r">Amount</th></tr>
     <tr><td>Corrugated boxes, 5-ply</td><td>${H('4819')}</td><td class="r">2,000</td><td class="r">₹35.00</td><td class="r">₹70,000.00</td></tr>
     <tr><td>Packing tape, 48 mm</td><td>3919</td><td class="r">600</td><td class="r">₹50.00</td><td class="r">₹30,000.00</td></tr>
   </table>
   <div style="display:flex;justify-content:flex-end;margin-top:22px">
     <div style="width:330px;font-size:14.5px">
       <div style="display:flex;justify-content:space-between;padding:7px 0"><span class="muted">Taxable value</span><b>₹1,00,000.00</b></div>
       <div style="display:flex;justify-content:space-between;padding:7px 0">${H('<span class="muted">CGST @ 9% &nbsp;·&nbsp; SGST @ 9%</span>')}<b>₹18,000.00</b></div>
       <div style="display:flex;justify-content:space-between;padding:12px 0;border-top:1.5px solid #ebe8f0;margin-top:6px">${H('<b>Balance due</b>')}<b style="color:#7b2ff2">₹1,18,000.00</b></div>
     </div>
   </div>
   <div class="muted" style="margin-top:26px;font-size:13px">Amount in words: Rupees One Lakh Eighteen Thousand Only</div>
   <div style="margin-top:22px">${H('<div class="muted" style="font-size:13px">Bank details<br>A/c 50200012345678 · IFSC ABCD0001234<br>UPI sharmatraders@upi</div>')}</div>
   <div class="scan-tint"></div><div class="scan-line"></div>
  </div>`;
}

/* ---------- mail window ---------- */
function mailWindow(id, mode) {
  const side = `<div style="width:78px;background:#f1eff6;display:flex;flex-direction:column;align-items:center;gap:26px;padding-top:24px">
     ${['#5b4dff', '#c9c3d6', '#c9c3d6', '#c9c3d6', '#c9c3d6'].map((c, i) => `<div style="width:30px;height:30px;border-radius:${i ? 8 : 15}px;background:${c};opacity:${i ? .8 : 1}"></div>`).join('')}</div>`;
  const listItem = (hl, a, b) => `<div style="display:flex;gap:14px;padding:18px 18px;border-bottom:1px solid #ebe8f0;${hl ? 'background:#efe8ff;border-left:4px solid #8f5bff' : ''}">
      <div style="width:44px;height:44px;border-radius:50%;background:${hl ? 'linear-gradient(135deg,#5b4dff,#ff5fc3)' : '#dcd7e5'};flex:none"></div>
      <div style="flex:1">${a ? `<div style="font-size:16px;font-weight:700">${a}</div><div style="font-size:14px;color:#6c6579;margin-top:3px">${b}</div>` :
      `<div class="skel" style="width:70%"></div><div class="skel" style="width:90%;margin-top:10px"></div><div class="skel" style="width:55%;margin-top:10px"></div>`}</div></div>`;
  const toolbar = `<div style="height:74px;display:flex;align-items:center;gap:26px;padding:0 24px;border-bottom:1px solid #e8e5ee;background:#fbfaff;font-size:16px;color:#4a4357">
      <div class="btn-grad" style="height:46px;padding:0 22px;border-radius:23px;display:flex;align-items:center;gap:10px;font-weight:700;background:linear-gradient(90deg,#1b0f2a,#3b1a6b 70%,#7b2ff2)">${ICON.compose('#fff').replace(/64/g, '20')} New mail</div>
      <span>➤ Send ▾</span><span>🗑 Discard</span><span>📎 Attach</span><span>✎ Sign</span><span>⏱ Schedule</span><span>···</span>
      <div style="margin-left:auto;width:300px;height:42px;border-radius:21px;background:#efedf4;display:flex;align-items:center;padding:0 18px;color:#9a94a6">⌕ Search mail</div></div>`;
  let pane;
  if (mode === 'compose') {
    pane = `<div style="flex:1;padding:30px 36px;position:relative" class="compose">
      <div style="display:flex;align-items:center;gap:12px;font-size:17px;padding-bottom:16px;border-bottom:1px solid #ebe8f0">
        <span style="color:#8a8496">To</span><span style="background:#efe8ff;color:#4b2a9a;padding:7px 14px;border-radius:18px;font-weight:600">${COPY.inbox}</span></div>
      <div style="font-size:17px;padding:16px 0;border-bottom:1px solid #ebe8f0"><span style="color:#8a8496">Subject</span>&nbsp;&nbsp; Purchase bills – November</div>
      <div class="attach-zone" style="height:84px;display:flex;align-items:center;gap:14px;padding-top:12px">
        <div class="attach-chip" style="display:flex;align-items:center;gap:12px;padding:10px 16px;border:1.5px solid #e2dcec;border-radius:12px;background:#fff;opacity:0">
          ${ICON.pdf}<div><div style="font-size:15px;font-weight:700">Sharma-Traders-Bill.pdf</div><div style="font-size:13px;color:#8a8496">412 KB</div></div></div></div>
      <div style="display:flex;gap:18px;padding:14px 0;border-bottom:1px solid #ebe8f0;color:#b1abbd;font-size:15px"><b>B</b><i>I</i><u>U</u><span>≡</span><span>•</span><span>1.</span><span>🔗</span><span>☺</span></div>
      <div style="padding-top:22px"><div class="skel" style="width:60%"></div><div class="skel" style="width:85%;margin-top:14px"></div><div class="skel" style="width:40%;margin-top:14px"></div></div>
     </div>`;
  } else {
    pane = `<div style="flex:1;background:#efedf4;display:flex;justify-content:center;padding-top:34px;position:relative">
      <div class="mail-card" style="width:720px;height:640px;background:#fff;border-radius:20px;padding:40px 46px;box-shadow:0 10px 40px rgba(60,30,110,.12);text-align:center;position:relative">
        <div style="display:flex;align-items:center;justify-content:center;gap:10px">${logo('', 'width:34px;height:34px;color:#17111f')}<b style="font-size:20px">Vyapar<span class="grad-ink">IQ</span></b></div>
        <div style="width:64px;height:64px;border-radius:50%;margin:26px auto 0;background:#dffbe9;padding:12px">${ICON.check('#19b56a')}</div>
        <div style="font-size:28px;font-weight:800;margin-top:18px">Your purchase entry is ready</div>
        <div style="text-align:left;margin-top:28px;font-size:17px;line-height:1.6;color:#3a3346"><b>Hi ${COPY.user},</b><br>Your purchase voucher has been auto-created and GST-matched. It is ready for your review.</div>
        <div style="margin-top:24px;border:1.5px solid #ebe8f0;border-radius:14px;text-align:left;font-size:15px">
          <div style="display:grid;grid-template-columns:1.2fr 1.2fr 1fr;padding:12px 18px;color:#8a8496;background:#faf9fc;border-radius:14px 14px 0 0"><span>Bill</span><span>Party</span><span style="text-align:right">Amount</span></div>
          <div style="display:grid;grid-template-columns:1.2fr 1.2fr 1fr;padding:16px 18px;font-weight:600"><span>ST/25-26/0482</span><span>Sharma Traders</span><span style="text-align:right">₹1,18,000.00</span></div></div>
        <div class="review-btn btn-grad" style="margin:30px auto 0;width:230px;height:56px;border-radius:28px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700">Review entry</div>
      </div></div>`;
  }
  const list = mode === 'compose'
    ? listItem(false) + listItem(false) + listItem(false) + listItem(false)
    : listItem(true, 'VyaparIQ', 'Your purchase entry is ready') + listItem(false) + listItem(false) + listItem(false);
  return `<div class="win rim" id="${id}" style="width:1680px;height:980px">
     <div class="win-top"><i style="background:#ff5f57"></i><i style="background:#febc2e"></i><i style="background:#28c840"></i></div>
     ${toolbar}
     <div style="display:flex;height:862px">${side}
       <div style="width:380px;border-right:1px solid #e8e5ee;background:#fff"><div style="padding:18px;font-weight:700;font-size:18px">Inbox</div>${list}</div>
       ${pane}</div>
   </div>`;
}

/* ---------- dashboard ---------- */
function dashboardHTML() {
  const nav = ['Dashboard', 'Vouchers', 'Ledgers', 'GST & Returns', 'Banking', 'Reports', 'Settings'];
  const kpi = (l, v, d, c) => `<div style="background:#fff;border:1.5px solid #ece8f2;border-radius:16px;padding:20px 22px">
      <div style="font-size:14px;color:#8a8496;font-weight:600">${l}</div><div style="font-size:28px;font-weight:800;margin-top:8px">${v}</div>
      <div style="font-size:13px;color:${c};margin-top:6px;font-weight:600">${d}</div></div>`;
  const row = (p, t, d, st, amt, ai) => `<div style="display:grid;grid-template-columns:1.6fr 1fr 60px 120px 1fr;align-items:center;padding:16px 8px;border-bottom:1px solid #f0edf4;font-size:15px">
      <div><b>${p}</b><div style="font-size:13px;color:#8a8496">${t}</div></div><span style="color:#5d5669">${d}</span>
      <span>${ai ? `<span style="display:inline-flex;width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#5b4dff,#c25cff);align-items:center;justify-content:center">${spark(14, '', true).replace(/#8f7dff|#c25cff|#ff7ad3/g, '#fff')}</span>` : ''}</span>
      <span><span class="badge" style="font-size:12px;font-weight:800;letter-spacing:.06em;padding:6px 12px;border-radius:8px;${st === 'DRAFT' ? 'background:#17111f;color:#fff' : 'background:#dffbe9;color:#128a4f'}">${st}</span></span>
      <b style="text-align:right">${amt}</b></div>`;
  return `<div class="win" id="dash" style="width:1640px;height:980px;background:#f6f4fa;box-shadow:0 -12px 60px rgba(160,110,255,.35),0 50px 120px rgba(80,40,140,.28)">
    <div style="height:44px;background:#1a1024;display:flex;align-items:center;gap:9px;padding:0 20px"><i style="width:13px;height:13px;border-radius:50%;background:#ff5f57;display:block"></i><i style="width:13px;height:13px;border-radius:50%;background:#febc2e;display:block"></i><i style="width:13px;height:13px;border-radius:50%;background:#28c840;display:block"></i>
      <div style="margin-left:24px;width:420px;height:26px;border-radius:13px;background:#2a1f36;color:#9a90a8;font:13px var(--ui);display:flex;align-items:center;padding-left:14px">app.vyapariq.com/dashboard</div></div>
    <div style="display:flex;height:936px" class="ui">
      <div style="width:250px;background:#140b1e;color:#cfc7da;padding:26px 20px">
        <div style="display:flex;align-items:center;gap:10px;color:#fff">${logo('', 'width:38px;height:38px;color:#fff')}<b style="font-size:20px;font-family:var(--sans)">Vyapar<span class="grad">IQ</span></b></div>
        <div style="margin-top:26px;background:#22162e;border-radius:12px;padding:12px 14px;font-size:14px;color:#fff">${COPY.company} ▾</div>
        <div style="margin-top:22px;display:flex;flex-direction:column;gap:6px;font-size:15px">${nav.map((n, i) => `<div style="padding:11px 14px;border-radius:10px;${i === 0 ? 'background:#2c1c40;color:#fff;font-weight:600' : ''}">${n}</div>`).join('')}</div>
      </div>
      <div style="flex:1;padding:30px 36px;position:relative">
        <div style="font-size:36px;font-weight:800;font-family:var(--sans)">Namaste, <span class="grad-ink">${COPY.user}</span></div>
        <div style="font-size:15px;color:#8a8496;margin-top:6px">Here is your business today · 12 Nov 2025</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr) 300px;gap:18px;margin-top:26px">
          ${kpi('Cash & bank', '₹18,42,350', '▲ 12% this month', '#128a4f')}${kpi('Receivables', '₹6,20,400', '4 invoices due', '#8a8496')}
          ${kpi('Payables', '₹3,75,900', '2 bills this week', '#8a8496')}${kpi('GST payable · Nov', '₹48,210', 'Due 20 Nov', '#c26a00')}
          <div style="background:#ffe9a8;border-radius:16px;padding:18px 20px"><div style="font-size:14px;font-weight:800;color:#7a5200">Action required</div><div style="font-size:15px;color:#5c4300;margin-top:8px">3 AI entries are waiting for your review</div></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 300px;gap:18px;margin-top:22px">
          <div style="background:#fff;border:1.5px solid #ece8f2;border-radius:16px;padding:20px 22px" id="dash-table">
            <div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:19px">Latest entries</b><span style="font-size:14px;color:#7b2ff2;font-weight:600">View all</span></div>
            <div style="display:flex;gap:22px;font-size:14px;color:#8a8496;margin:14px 0 4px;border-bottom:1px solid #ece8f2;padding-bottom:10px"><b style="color:#17111f">All</b><span>Purchase</span><span>Sales</span><span>Expenses</span></div>
            <div id="dash-row1">${row('Sharma Traders', 'Purchase · GST 18%', '12 Nov 2025', 'DRAFT', '₹1,18,000.00', true)}</div>
            ${row('Patel Logistics', 'Expense · Freight', '10 Nov 2025', 'POSTED', '₹24,780.00', true)}
            ${row('Mehta Retail', 'Sales · GST 12%', '08 Nov 2025', 'POSTED', '₹2,36,000.00', false)}
            ${row('Kapoor Steels', 'Purchase · GST 18%', '06 Nov 2025', 'POSTED', '₹88,500.00', true)}
          </div>
          <div style="background:linear-gradient(160deg,#1f1030,#3a1667);border-radius:16px;padding:22px;color:#fff">
            <div style="display:flex;gap:8px;align-items:center;font-weight:700">${spark(20, '', true)} AI insight</div>
            <div style="font-size:16px;margin-top:14px;line-height:1.5;color:#e6dcf5">Cash flow is positive this month. ₹62,000 GST input credit is available to claim.</div>
            <div style="margin-top:18px;height:90px;display:flex;align-items:flex-end;gap:10px">${[40, 55, 48, 70, 62, 85].map(h => `<div style="flex:1;height:${h}%;border-radius:6px;background:linear-gradient(180deg,#c25cff,#5b4dff)"></div>`).join('')}</div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

/* ---------- voucher form ---------- */
function formHTML() {
  const seg = (id, opts, cols) => `<div class="seg" id="${id}" style="grid-template-columns:repeat(${cols},1fr)">${opts.map(o => `<div><span>${o[0]}</span>${o[1] ? `<small>${o[1]}</small>` : ''}</div>`).join('')}</div>`;
  const S = spark(24, 'spark-ico');
  return `<div id="form-card" class="ui" style="position:absolute;width:1560px;height:1400px;background:#fff;border-radius:28px;padding:40px 48px;
      box-shadow:0 0 0 2px rgba(120,255,190,.55),0 0 40px rgba(110,255,180,.35),0 -10px 60px rgba(150,90,255,.5),0 60px 140px rgba(0,0,0,.6)">
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;font-size:15px;color:#8a8496;font-weight:600">
      <div>Creation<div style="height:4px;border-radius:2px;background:linear-gradient(90deg,#5b4dff,#a41cf2);margin-top:10px"></div></div>
      <div style="text-align:center">Review<div style="height:4px;background:#ece8f2;margin-top:10px"></div></div>
      <div style="text-align:right">Confirmation<div style="height:4px;background:#ece8f2;margin-top:10px"></div></div></div>
    <div style="display:grid;grid-template-columns:880px 1fr;gap:48px;margin-top:34px">
      <div>
        <div style="font-size:34px;font-weight:800;font-family:var(--sans)">Create purchase voucher</div>
        <div style="margin-top:20px;background:#f4f1f9;border-radius:14px;padding:14px 18px;display:flex;align-items:center;gap:14px">${ICON.pdf}
          <div><div style="font-size:16px;font-weight:700">Sharma-Traders-Bill.pdf</div><div style="font-size:13px;color:#8a8496">Received by email · 2 min ago</div></div>
          <span style="margin-left:auto;font-size:13px;font-weight:700;color:#7b2ff2;display:flex;gap:6px;align-items:center">${spark(16)} Read by AI</span></div>
        <div style="margin-top:24px"><div class="fld-lbl">Party (supplier)</div><div class="fld"><span>Sharma Traders<span class="sub">GSTIN 27AAPFS4821K1Z3</span></span>${S}</div></div>
        <div style="margin-top:20px"><div class="fld-lbl">Purchase ledger</div><div class="fld"><span>Purchase @ 18% GST<span class="sub">Raw material – packaging</span></span>${S}</div></div>
        <div style="display:grid;grid-template-columns:1.2fr 1fr 1fr;gap:16px;margin-top:20px">
          <div><div class="fld-lbl">Taxable value</div><div class="fld">₹1,00,000.00${S}</div></div>
          <div><div class="fld-lbl">CGST 9%</div><div class="fld">₹9,000.00${S}</div></div>
          <div><div class="fld-lbl">SGST 9%</div><div class="fld">₹9,000.00${S}</div></div></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:20px">
          <div><div class="fld-lbl">Bill no.</div><div class="fld">ST/25-26/0482${S}</div></div>
          <div><div class="fld-lbl">Bill date</div><div class="fld">12 Nov 2025${S}</div></div></div>
        <div style="margin-top:26px"><div class="fld-lbl">Posting</div>${seg('seg-post', [['Post now', ''], ['Schedule', 'Pick a date']], 2)}</div>
        <div style="margin-top:22px"><div class="fld-lbl">Payment terms</div>${seg('seg-pay', [['Credit', '15 days'], ['Paid', 'Cash / bank']], 2)}</div>
        <div style="margin-top:22px"><div class="fld-lbl">Category</div>${seg('seg-cat', [['Raw material', 'ITC eligible'], ['Services', ''], ['Expense', '']], 3)}</div>
        <div style="margin-top:22px"><div class="fld-lbl">Notify party <span style="color:#7b2ff2">+ Add email</span></div><div class="fld" style="color:#b1abbd;font-weight:500">Enter email address</div></div>
        <div style="display:flex;justify-content:flex-end;margin-top:30px"><div id="approve-btn" class="btn-grad" style="height:72px;padding:0 44px;border-radius:36px;display:flex;align-items:center;font-size:22px;font-weight:700;position:relative;overflow:hidden">
          <span style="position:relative;z-index:1">Send for approval</span><div class="shine" style="position:absolute;top:0;bottom:0;width:120px;left:-160px;background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.55),rgba(255,255,255,0));transform:skewX(-20deg)"></div></div></div>
      </div>
      <div style="padding-top:6px"><div style="transform:scale(.72);transform-origin:0 0;border:1.5px solid #ece8f2;border-radius:16px;width:760px">${invoiceHTML(false)}</div></div>
    </div>
  </div>`;
}

/* ---------- approvers ---------- */
function approverRow(id, ini, name, role, grad) {
  return `<div id="${id}" style="position:absolute;left:0;width:820px;height:112px;background:#fff;border-radius:20px;display:flex;align-items:center;gap:20px;padding:0 28px;color:#17111f;font-family:var(--ui)">
     <div style="width:62px;height:62px;border-radius:50%;background:${grad};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:22px">${ini}</div>
     <div><div style="font-size:16px;color:#6c6579">${name}</div><div style="font-size:20px;font-weight:700">${role}</div></div>
     <div class="st" style="margin-left:auto;width:46px;height:46px;position:relative">
       <div class="spin" style="position:absolute;inset:0;border-radius:50%;border:4px solid rgba(76,240,168,.25);border-top-color:#2fd98d;opacity:0"></div>
       <div class="ok" style="position:absolute;inset:0;border-radius:50%;background:#4cf0a8;padding:9px;opacity:0;box-shadow:0 0 18px rgba(76,240,168,.7)">${ICON.check('#0b3d26')}</div></div>
   </div>`;
}

/* ---------- build everything ---------- */
async function buildDOM() {
  LOGO_SVG = await (await fetch('assets/logo.svg')).text();
  const S = document.getElementById('stage');
  const starMask = `url('data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="${STAR_D}"/></svg>`)}')`;
  const cards = `
    <div class="fcard" data-c style="left:330px;top:64px;width:470px"><h4>Purchase Voucher <span style="color:#bbb">×</span></h4>
      <div class="lbl">Party A/c name</div><div class="inp">Select party</div><div class="lbl">Purchase ledger</div><div class="inp">Select ledger</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><div><div class="lbl">Amount</div><div class="inp">₹</div></div><div><div class="lbl">GST rate</div><div class="inp">%</div></div></div></div>
    <div class="fcard" data-c style="left:860px;top:-34px;width:560px"><h4>Ledger: Sharma Traders <span style="font-weight:500;font-size:13px;color:#999">1-Apr-25 to 31-Mar-26</span></h4>
      ${['Date|Particulars|Debit|Credit', '02-Nov|Purchase A/c|70,000|', '05-Nov|Bank A/c||50,000', '09-Nov|Purchase A/c|30,000|', '11-Nov|GST Input|18,000|'].map((r, i) => `<div class="trow ${i ? '' : 'hd'}" style="grid-template-columns:80px 1fr 90px 90px">${r.split('|').map(c => `<span>${c}</span>`).join('')}</div>`).join('')}</div>
    <div class="fcard dk" data-c style="left:1490px;top:70px;width:360px"><h4 style="color:#fff">GSTR-3B · Nov 2025</h4>
      ${['Outward taxable supplies', 'Eligible ITC', 'Tax payable', 'Late fee'].map(r => `<div class="trow" style="grid-template-columns:1fr 70px"><span>${r}</span><span class="skel" style="background:#3a2d48;height:8px;margin-top:4px"></span></div>`).join('')}</div>
    <div class="fcard" data-c style="left:250px;top:716px;width:430px"><h4>Enter bill details <span style="color:#bbb">×</span></h4>
      <div class="lbl">Bill date</div><div class="inp">Select date ${ICON.cal}</div></div>
    <div class="fcard" data-c style="left:790px;top:752px;width:1160px"><h4>Day Book <span style="font-weight:500;font-size:13px;color:#999">For 12-Nov-2025</span></h4>
      ${['Date|Particulars|Vch type|Vch no.|Debit|Credit', '12-Nov|Sharma Traders|Purchase|482|1,18,000|', '12-Nov|HDFC Bank|Payment|219||24,780', '12-Nov|Mehta Retail|Sales|1043||2,36,000'].map((r, i) => `<div class="trow ${i ? '' : 'hd'}" style="grid-template-columns:90px 1fr 120px 90px 120px 120px">${r.split('|').map(c => `<span>${c}</span>`).join('')}</div>`).join('')}</div>
    <div class="fcard dk" data-c style="left:1520px;top:690px;width:370px"><h4 style="color:#fff">Bank reconciliation</h4>
      ${['Balance as per books', 'Cheques not cleared', 'Balance as per bank'].map(r => `<div class="trow" style="grid-template-columns:1fr 80px"><span>${r}</span><span class="skel" style="background:#3a2d48;height:8px;margin-top:4px"></span></div>`).join('')}</div>
    <div class="fcard" data-c data-far style="left:-90px;top:170px;width:400px;opacity:.6"><h4>Stock summary</h4>${[1, 2, 3, 4].map(() => `<div class="trow" style="grid-template-columns:1fr 60px 60px"><span class="skel" style="width:80%"></span><span class="skel"></span><span class="skel"></span></div>`).join('')}</div>
  `;

  S.innerHTML = `
  <!-- S1 hook -->
  <section class="scene" id="s1"><div class="bg-dark"></div>
    <div class="layer" id="s1-cards">${cards}</div>
    <div class="center"><div id="s1-text" style="position:relative;width:1px;height:140px">
      <div class="cap" style="position:absolute;left:50%;top:0;transform:translateX(-50%);font-size:118px"><span class="tw" id="twA"></span></div>
      <div class="cap" style="position:absolute;left:50%;top:0;transform:translateX(-50%);font-size:118px"><span class="tw" id="twB"></span></div>
    </div></div>
  </section>

  <!-- S2 meet + logo -->
  <section class="scene" id="s2"><div class="bg-dark"></div>
    <div class="center" id="s2-wrap">
      <div class="cap" id="s2-meet" style="position:absolute;font-size:160px;font-weight:500;color:#efe7ff">${COPY.meet}</div>
      <div id="s2-logo" style="position:absolute;display:flex;align-items:center;gap:34px;color:#fff">${logo('', 'width:190px;height:190px;color:#fff')}
        <div style="font-size:150px;font-weight:800;letter-spacing:-0.035em">${COPY.brandA}<span class="grad">${COPY.brandB}</span></div></div>
      <div id="s2-pill" style="position:absolute;top:620px;height:112px;padding:0 50px 0 40px;border-radius:56px;display:flex;align-items:center;gap:18px;
          background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.02));border:2px solid rgba(190,160,255,.55);
          box-shadow:0 0 40px rgba(150,90,255,.45), inset 0 0 30px rgba(150,90,255,.25)">
        <span class="w">${spark(46, '', true)}</span><span class="cap" style="font-size:52px">${words(COPY.tagline.split(' '))}</span></div>
    </div>
  </section>

  <!-- S3a send bills -->
  <section class="scene" id="s3a"><div class="bg-dark"></div>
    <div class="center"><div class="cap" id="s3a-line" style="font-size:140px">${words(COPY.send, ['bills'])}</div></div>
  </section>

  <!-- S3b new mail morph -->
  <section class="scene" id="s3b"><div class="bg-dark"></div>
    <div class="center"><div id="nm-group" style="position:relative;width:1920px;height:300px;display:flex;align-items:center;justify-content:center">
      <div id="nm-strip" style="position:absolute;left:0;right:0;height:200px;top:50px;background:linear-gradient(90deg,rgba(240,232,255,0),rgba(240,232,255,.95) 22%,rgba(240,232,255,.95) 78%,rgba(240,232,255,0));
         display:flex;align-items:center;justify-content:space-between;padding:0 470px">${ICON.menu('#9a8fb0')}${ICON.send('#9a8fb0')}</div>
      <div id="nm-glow" style="position:absolute;width:700px;height:420px;top:120px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,255,255,.95),rgba(200,160,255,.6) 40%,rgba(150,90,255,0));opacity:0"></div>
      <div id="nm-btn" style="position:relative;width:620px;height:172px;border-radius:86px;background:#12081c;display:flex;align-items:center;justify-content:center;gap:26px;
          border:2px solid rgba(190,160,255,.6);box-shadow:0 0 50px rgba(150,90,255,.5);overflow:hidden">
        <div id="nm-fill" style="position:absolute;inset:0;background:linear-gradient(90deg,#5b4dff,#a41cf2 55%,#ff5fc3);opacity:0"></div>
        <div id="nm-ico" style="position:relative">${ICON.compose('#fff')}</div>
        <div id="nm-txt" style="position:relative;font-size:70px;font-weight:600;white-space:nowrap;overflow:hidden">New mail</div>
      </div>
    </div></div>
  </section>

  <!-- S3c compose mail -->
  <section class="scene" id="s3c"><div class="bg-dark"></div>
    <div class="cap" id="s3c-cap" style="position:absolute;left:0;right:0;top:92px;text-align:center;font-size:96px">${words(COPY.toEmail, ['email'])}</div>
    <div class="persp" id="s3c-cam"><div class="p3d" id="s3c-rig" style="position:absolute;left:180px;top:150px;width:1680px;height:980px">
      ${mailWindow('mailA', 'compose')}
      <div id="drag-pdf" style="position:absolute;left:1220px;top:760px;width:150px;height:190px;background:#fff;border-radius:12px;box-shadow:0 20px 50px rgba(40,10,80,.35);padding:16px;z-index:5">
        <div style="font-size:11px;font-weight:800;color:#7b2ff2">Sharma Traders</div><div class="skel" style="margin-top:12px;height:7px"></div><div class="skel" style="margin-top:8px;height:7px;width:70%"></div>
        <div class="skel" style="margin-top:18px;height:7px"></div><div class="skel" style="margin-top:8px;height:7px"></div><div class="skel" style="margin-top:8px;height:7px;width:50%"></div>
        <div style="position:absolute;left:12px;bottom:12px">${ICON.pdf}</div></div>
      ${cursor('curA')}
    </div></div>
  </section>

  <!-- S4 extract -->
  <section class="scene" id="s4"><div class="bg-dark"></div>
    <div class="cap" id="s4-l" style="position:absolute;right:1175px;top:478px;font-size:104px">${words(COPY.extractL)}</div>
    <div class="cap" id="s4-r" style="position:absolute;left:1175px;top:478px;font-size:104px">${words(COPY.extractR, ['details'])}</div>
    <div class="persp"><div id="s4-doc" class="p3d" style="position:absolute;left:580px;top:40px;width:760px;height:1000px">
      <div style="position:absolute;inset:0;border-radius:14px;box-shadow:0 0 0 1px rgba(255,255,255,.2),0 30px 90px rgba(0,0,0,.6),0 0 80px rgba(150,90,255,.35)"></div>
      ${invoiceHTML(true)}
      <div class="bracket" data-b="tl" style="left:-34px;top:-34px;border-top-width:6px;border-left-width:6px;border-top-left-radius:18px"></div>
      <div class="bracket" data-b="tr" style="right:-34px;top:-34px;border-top-width:6px;border-right-width:6px;border-top-right-radius:18px"></div>
      <div class="bracket" data-b="bl" style="left:-34px;bottom:-34px;border-bottom-width:6px;border-left-width:6px;border-bottom-left-radius:18px"></div>
      <div class="bracket" data-b="br" style="right:-34px;bottom:-34px;border-bottom-width:6px;border-right-width:6px;border-bottom-right-radius:18px"></div>
    </div></div>
  </section>

  <!-- S5 seconds later + inbox -->
  <section class="scene" id="s5"><div class="bg-dark"></div>
    <div class="center"><div class="cap" id="s5-later" style="font-size:104px;--p:0;-webkit-mask-image:linear-gradient(90deg,#000 calc(var(--p)*1% - 18%),transparent calc(var(--p)*1%));mask-image:linear-gradient(90deg,#000 calc(var(--p)*1% - 18%),transparent calc(var(--p)*1%))">And seconds <span class="grad">later</span></div></div>
    <div class="persp" id="s5-cam"><div class="p3d" id="s5-rig" style="position:absolute;left:120px;top:120px;width:1680px;height:980px">
      ${mailWindow('mailB', 'read')}${cursor('curB')}
    </div></div>
  </section>

  <!-- S6 quick check (white) – revealed through a sparkle-shaped mask -->
  <section class="scene" id="s6" style="--ms:0;-webkit-mask:${starMask} center / calc(var(--ms)*1px) calc(var(--ms)*1px) no-repeat;mask:${starMask} center / calc(var(--ms)*1px) calc(var(--ms)*1px) no-repeat"><div class="bg-light"></div>
    <div class="center" id="s6-line"><div class="cap dark-ink" id="s6-text" style="font-size:118px;position:relative">${words(COPY.quick, ['check'], 'grad-ink')}
      <div id="s6-trail"></div>
      <div id="s6-spark" style="position:absolute;left:0;top:0;width:300px;height:300px">${spark3d(300, 'sp-main')}</div></div></div>
  </section>

  <!-- S7 dashboard -->
  <section class="scene" id="s7">
    <div class="persp" style="perspective:2600px"><div class="p3d" id="s7-rig" style="position:absolute;left:180px;top:130px;width:1640px;height:980px">${dashboardHTML()}${cursor('curC')}</div></div>
    <div class="center"><div id="iso-row" class="ui" style="position:absolute;width:1240px;height:120px;background:#fff;border-radius:22px;display:grid;
        grid-template-columns:1.5fr 1fr 70px 150px 1fr;align-items:center;padding:0 40px;font-size:22px;opacity:0;
        box-shadow:0 30px 80px rgba(90,40,170,.18),0 2px 0 rgba(170,130,255,.5),0 18px 40px -10px rgba(164,87,255,.55)">
      <div><b>Sharma Traders</b><div style="font-size:16px;color:#8a8496">Purchase · GST 18%</div></div><span style="color:#5d5669">12 Nov 2025</span>
      <span style="display:inline-flex;width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#5b4dff,#c25cff);align-items:center;justify-content:center">${spark(20, '', true).replace(/#8f7dff|#c25cff|#ff7ad3/g, '#fff')}</span>
      <span><span id="iso-draft" style="display:inline-block;font-size:17px;font-weight:800;letter-spacing:.08em;padding:9px 18px;border-radius:10px;background:#17111f;color:#fff">DRAFT</span></span>
      <b style="text-align:right">₹1,18,000.00 <span style="font-size:13px;border:1.5px solid #c9c3d6;border-radius:6px;padding:2px 6px;color:#6c6579">INR</span></b>
    </div>${cursor('curD')}</div>
  </section>

  <!-- S8 voucher form -->
  <section class="scene" id="s8"><div class="bg-dark"></div>
    <div class="persp" style="perspective:2600px"><div class="p3d" id="s8-cam" style="position:absolute;inset:0">
      <div class="p3d" id="s8-rig" style="position:absolute;left:180px;top:60px;width:1560px;height:1300px">${formHTML()}${cursor('curE')}</div></div></div>
  </section>

  <!-- S9/S10 approvals → approved → posted (dark), shrinks into a card -->
  <section class="scene" id="s9" style="background:transparent;z-index:5">
    <div id="s9-shrink" class="layer" style="clip-path:inset(0px 0px 0px 0px round 0px);transform-origin:50% 100%">
      <div class="bg-dark"></div>
      <div id="s9-content" class="layer" style="transform-origin:50% 50%">
        <div id="ap-wrap" style="position:absolute;left:550px;top:358px;width:820px;height:400px">
          <div id="ap-head" style="position:absolute;left:0;top:0;width:820px;height:96px;background:#fff;border-radius:20px;display:flex;align-items:center;justify-content:space-between;padding:0 32px;color:#17111f;font-size:24px;font-weight:600">Approvers<span style="font-size:20px">Status</span></div>
          ${approverRow('ap-r1', 'PM', 'Priya Mehta', 'Chartered Accountant', 'linear-gradient(135deg,#5b4dff,#a41cf2)')}
          ${approverRow('ap-r2', 'AG', 'Amit Gupta', 'Owner', 'linear-gradient(135deg,#a41cf2,#ff5fc3)')}
        </div>
        <div class="center"><div id="ap-box" style="position:absolute;width:820px;height:330px;border-radius:24px;background:#fff;opacity:0;overflow:hidden;
            box-shadow:0 0 60px rgba(190,150,255,.7);display:flex;align-items:center;justify-content:center">
          <div id="ap-fill" style="position:absolute;inset:0;background:linear-gradient(90deg,#6a5cff,#a63ff5 55%,#ff6fcf);opacity:0"></div>
          <div id="ap-gloss" style="position:absolute;left:0;right:0;top:0;height:50%;background:linear-gradient(180deg,rgba(255,255,255,.45),rgba(255,255,255,0));opacity:0"></div>
          <div id="ap-txt" class="cap" style="position:relative;font-size:58px;font-weight:500;color:#fff;opacity:0"><span class="w">Entry</span> <span class="w">approved</span></div>
        </div></div>
        <div class="center"><div id="ok-wrap" style="position:absolute;width:210px;height:210px">
          <svg width="210" height="210" viewBox="0 0 210 210" style="position:absolute;inset:0;overflow:visible;filter:drop-shadow(0 0 16px rgba(76,240,168,.75))">
            <circle id="ok-ring" cx="105" cy="105" r="92" fill="none" stroke="#4cf0a8" stroke-width="9" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" transform="rotate(-90 105 105)"/>
            <path id="ok-check" d="M70 108 L95 132 L142 80" fill="none" stroke="#ffffff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>
          </svg></div>
          <div id="ok-txt" style="position:absolute;top:600px;text-align:center;opacity:0">
            <div style="font-size:52px;font-weight:600">Entry posted</div>
            <div style="margin:22px auto 0;display:inline-flex;align-items:center;gap:10px;padding:12px 26px;border-radius:30px;border:2px solid rgba(190,160,255,.6);font:600 20px var(--ui);color:#e6dcf5;box-shadow:0 0 24px rgba(150,90,255,.4)">${ICON.dl('#e6dcf5')} Download voucher PDF</div>
          </div></div>
      </div>
    </div>
  </section>

  <!-- S11 benefits (white) -->
  <section class="scene" id="s11"><div class="bg-mint" id="s11-bg"></div><div class="bg-light" id="s11-bg2" style="opacity:0"></div>
    <div id="s11-stars" class="layer">${[[1400, .95, 3.5], [1950, .5, 2.5], [2600, .28, 2.5]].map(([S, o, w], i) => `<div class="s11-star" style="position:absolute;left:${960 - S / 2}px;top:${540 - S / 2}px;width:${S}px;height:${S}px">
      <svg viewBox="0 0 100 100" width="${S}" height="${S}" style="overflow:visible"><defs><linearGradient id="s11g${i}" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#5b4dff"/><stop offset=".55" stop-color="#a41cf2"/><stop offset="1" stop-color="#ff5fc3"/></linearGradient></defs>
      <path d="${STAR_D}" fill="none" stroke="url(#s11g${i})" stroke-width="${w * 100 / S}" opacity="${o}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg></div>`).join('')}</div>
    <div class="center"><div class="cap dark-ink" id="s11-save" style="font-size:116px">${words(COPY.save, ['errors.'], 'grad-ink')}</div></div>
    <div class="center"><div class="cap dark-ink" id="s11-ctrl" style="font-size:116px">${words(COPY.control, ['control'], 'grad-ink')}</div></div>
  </section>

  <!-- S12 end card -->
  <section class="scene" id="s12"><div class="bg-light"></div>
    <div class="center" id="s12-wrap">
      <div id="s12-logo" style="position:absolute;color:#17111f">${logo('', 'width:270px;height:270px')}</div>
      <div id="s12-word" style="position:absolute;left:810px;top:452px;font-size:150px;font-weight:800;letter-spacing:-0.035em;color:#17111f;--p:0;
          -webkit-mask-image:linear-gradient(90deg,#000 calc(var(--p)*1% - 12%),transparent calc(var(--p)*1%));mask-image:linear-gradient(90deg,#000 calc(var(--p)*1% - 12%),transparent calc(var(--p)*1%))">${COPY.brandA}<span class="grad-ink">${COPY.brandB}</span></div>
      <div id="s12-url" style="position:absolute;top:800px;height:78px;width:78px;border-radius:39px;background:#17111f;color:#fff;display:flex;align-items:center;justify-content:center;
          font:600 30px var(--ui);overflow:hidden;white-space:nowrap;box-shadow:0 14px 34px -8px rgba(164,87,255,.75),0 0 0 2px rgba(120,255,190,.0)"><span id="s12-urltxt" style="opacity:0">${COPY.url}</span></div>
    </div>
  </section>

  <!-- global overlays -->
  <div id="star-ring" style="position:absolute;left:960px;top:540px;width:0;height:0;pointer-events:none;z-index:80">
    <svg viewBox="0 0 100 100" style="position:absolute;left:-50%;top:-50%;width:100%;height:100%;overflow:visible;filter:blur(2px) drop-shadow(0 0 20px rgba(170,110,255,.9))">
      <defs><linearGradient id="srg" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#7b6bff"/><stop offset=".5" stop-color="#b44bff"/><stop offset="1" stop-color="#5cf2b0"/></linearGradient></defs>
      <path d="${STAR_D}" fill="none" stroke="url(#srg)" stroke-width="2.2" vector-effect="non-scaling-stroke" style="stroke-width:26px"/></svg></div>
  <div id="iris" style="position:absolute;inset:0;z-index:85;pointer-events:none;opacity:0;--r:1600;
      background:radial-gradient(circle at 50% 55%, rgba(7,2,12,0) calc(var(--r)*1px), rgba(7,2,12,1) calc(var(--r)*1px + 260px))"></div>
  `;
}
