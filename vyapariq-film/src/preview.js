const { chromium } = require('playwright');
(async () => {
  const dir = process.argv[2]; const times = process.argv.slice(3).map(Number);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('console', m => console.log('console:', m.text())); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file://' + __dirname + '/index.html', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  for (const t of times) { await p.evaluate(t => window.seek(t), t); await p.screenshot({ path: `${dir}/p_${t.toFixed(1).padStart(5,'0')}.jpg`, quality: 80 }); }
  await b.close();
})();
