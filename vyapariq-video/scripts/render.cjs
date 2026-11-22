/* Render the HTML timeline to video, frame by frame.
   Usage:
     node scripts/render.cjs                       -> out/video_silent.mp4 (all 1440 frames)
     node scripts/render.cjs --stills 0.5,5.6,17   -> out/stills/t_<time>.jpg (quick checks)
     node scripts/render.cjs --from 20 --to 24     -> partial render
   Requires Playwright (preinstalled) and ffmpeg. */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright'))); }

const ROOT = path.resolve(__dirname, '..');
const FPS = 30;
const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2', '.json': 'application/json', '.m4a': 'audio/mp4', '.mp3': 'audio/mpeg', '.png': 'image/png', '.jpg': 'image/jpeg' };

function serve() {
  return new Promise(res => {
    const srv = http.createServer((req, rsp) => {
      const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { rsp.writeHead(404); return rsp.end(); }
      rsp.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(rsp);
    }).listen(0, () => res(srv));
  });
}

(async () => {
  const srv = await serve();
  const url = `http://127.0.0.1:${srv.address().port}/index.html?render=1`;
  const browser = await chromium.launch({ args: ['--force-color-profile=srgb', '--disable-lcd-text'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('console', m => { if (m.type() === 'error') console.error('[page]', m.text()); });
  page.on('pageerror', e => console.error('[pageerror]', e.message));
  await page.goto(url);
  await page.waitForFunction('window.__ready === true', null, { timeout: 60000 });
  const stage = await page.$('#stage');
  const duration = await page.evaluate('window.__duration');

  const stills = arg('--stills');
  if (stills) {
    const dir = path.join(ROOT, 'out', 'stills'); fs.mkdirSync(dir, { recursive: true });
    for (const t of stills.split(',').map(Number)) {
      await page.evaluate(t => window.__seek(t), t);
      await stage.screenshot({ path: path.join(dir, `t_${t.toFixed(2)}.jpg`), type: 'jpeg', quality: 88 });
    }
    console.log('stills done');
    await browser.close(); srv.close(); return;
  }

  const from = +arg('--from', 0), to = +arg('--to', duration);
  const out = arg('--out', path.join(ROOT, 'out', 'video_silent.mp4'));
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart', out],
    { stdio: ['pipe', 'inherit', 'inherit'] });
  const n0 = Math.round(from * FPS), n1 = Math.round(to * FPS);
  const t0 = Date.now();
  for (let n = n0; n < n1; n++) {
    await page.evaluate(t => window.__seek(t), n / FPS);
    const buf = await stage.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (n % 60 === 0) console.log(`frame ${n}/${n1}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  console.log('done ->', out, ((Date.now() - t0) / 1000).toFixed(0) + 's');
  await browser.close(); srv.close();
})();
