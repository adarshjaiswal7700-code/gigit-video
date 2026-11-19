// Renders src/film.html frame by frame with headless Chromium.
// usage: node render.js frames <outDir> <startFrame> <endFrame>   |   node render.js stills <outDir> t1,t2,...
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const [mode, outDir, a, b] = process.argv.slice(2);
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('console', m => { if (m.type() === 'error') console.error('PAGE:', m.text()); });
  page.on('pageerror', e => console.error('PAGEERR:', e.message));
  await page.goto('file://' + path.resolve(__dirname, 'src/film.html'));
  await page.evaluate(() => document.fonts.ready);
  const fps = await page.evaluate(() => window.FPS);
  if (mode === 'stills') {
    for (const t of a.split(',').map(Number)) {
      await page.evaluate(t => window.seek(t), t);
      await page.screenshot({ path: path.join(outDir, `t${t.toFixed(2).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 88 });
    }
  } else {
    for (let f = +a; f < +b; f++) {
      await page.evaluate(t => window.seek(t), f / fps);
      await page.screenshot({ path: path.join(outDir, `f${String(f).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 96 });
    }
  }
  await browser.close();
})();
