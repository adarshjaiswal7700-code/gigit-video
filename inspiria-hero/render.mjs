// Renders index.html frame-by-frame to video with true subframe motion blur.
//
//   node render.mjs stills 0.5,2.6,5.4      -> out/stills/t_*.png  (quick checks)
//   node render.mjs video                   -> out/master.mkv (lossless) + web encodes
//
// Each output frame is the average of K subframes spread across a 180° shutter.
// K is raised inside the fast transition windows so whip-pans smear instead of strobing.
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const W = 1920, H = 1080, DUR = 15;
const FPS = +(process.env.FPS || 60);
const SHUTTER = 0.5;
const WORKERS = +(process.env.WORKERS || 3);
const K_BASE = +(process.env.K_BASE || 3), K_FAST = +(process.env.K_FAST || 10);
const FAST = [[0.04, 0.8], [2.3, 3.45], [4.85, 5.55], [5.95, 6.4], [6.85, 7.3], [7.75, 8.2], [8.8, 9.75], [10.25, 11.25], [11.4, 12.4], [14.45, 15.0]];
const OUT = path.join(here, 'out');
const url = pathToFileURL(path.join(here, 'index.html')).href + '?render=1';

async function openPage() {
  const browser = await chromium.launch({ args: ['--force-color-profile=srgb', '--disable-lcd-text', '--font-render-hinting=none'] });
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('pageerror', e => { console.error('PAGE ERROR', e); process.exit(1); });
  page.on('console', m => { if (m.type() === 'error') console.error('console:', m.text()); });
  await page.goto(url);
  await page.evaluate(() => window.__ready);
  const cdp = await page.context().newCDPSession(page);
  const shot = async t => {
    await page.evaluate(t => window.__render(t), t);
    const r = await cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true, clip: { x: 0, y: 0, width: W, height: H, scale: 1 } });
    return Buffer.from(r.data, 'base64');
  };
  return { browser, shot };
}

const kFor = f => { const t = f / FPS; return FAST.some(([a, b]) => t >= a && t <= b) ? K_FAST : K_BASE; };

async function frameRGB(shot, f) {
  const K = kFor(f), acc = new Uint32Array(W * H * 3);
  for (let s = 0; s < K; s++) {
    const t = (f + SHUTTER * ((s + 0.5) / K - 0.5)) / FPS;
    const png = PNG.sync.read(await shot((t + DUR) % DUR));
    const d = png.data;
    for (let i = 0, j = 0; i < d.length; i += 4, j += 3) { acc[j] += d[i]; acc[j + 1] += d[i + 1]; acc[j + 2] += d[i + 2]; }
  }
  const out = Buffer.allocUnsafe(W * H * 3);
  for (let j = 0; j < out.length; j++) out[j] = Math.round(acc[j] / K);
  return out;
}

function ffmpeg(args) {
  const p = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: ['pipe', 'inherit', 'inherit'] });
  p.done = new Promise((res, rej) => p.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg exit ' + c))));
  return p;
}

async function stills(times) {
  mkdirSync(path.join(OUT, 'stills'), { recursive: true });
  const { browser, shot } = await openPage();
  for (const t of times) writeFileSync(path.join(OUT, 'stills', `t_${t.toFixed(2).padStart(5, '0')}.png`), await shot(t));
  await browser.close();
}

async function segment(idx, f0, f1) {
  const file = path.join(OUT, 'seg', `seg_${idx}.mkv`);
  const enc = ffmpeg(['-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264rgb', '-qp', '0', '-preset', 'ultrafast', file]);
  const { browser, shot } = await openPage();
  const t0 = Date.now();
  for (let f = f0; f < f1; f++) {
    const buf = await frameRGB(shot, f);
    if (!enc.stdin.write(buf)) await new Promise(r => enc.stdin.once('drain', r));
    if ((f - f0) % 30 === 0) console.log(`[w${idx}] frame ${f}/${f1 - 1}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  enc.stdin.end(); await enc.done; await browser.close();
  return file;
}

async function video() {
  mkdirSync(path.join(OUT, 'seg'), { recursive: true });
  const N = Math.round(DUR * FPS);
  // balance work by subframe cost, not frame count
  const cost = Array.from({ length: N }, (_, f) => kFor(f)), total = cost.reduce((a, b) => a + b, 0);
  const bounds = [0]; let acc = 0;
  for (let f = 0; f < N; f++) { acc += cost[f]; if (acc >= total * bounds.length / WORKERS && bounds.length < WORKERS) bounds.push(f + 1); }
  bounds.push(N);
  const files = await Promise.all(bounds.slice(0, -1).map((b, i) => segment(i, b, bounds[i + 1])));
  writeFileSync(path.join(OUT, 'seg', 'list.txt'), files.map(f => `file '${f}'`).join('\n'));
  await ffmpeg(['-f', 'concat', '-safe', '0', '-i', path.join(OUT, 'seg', 'list.txt'), '-c', 'copy', path.join(OUT, 'master.mkv')]).done;
  console.log('master written');
}

const [mode, arg] = process.argv.slice(2);
if (mode === 'stills') await stills(arg.split(',').map(Number));
else if (mode === 'video') await video();
else console.log('usage: node render.mjs stills 1,2,3 | video');
