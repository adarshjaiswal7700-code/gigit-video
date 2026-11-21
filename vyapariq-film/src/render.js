const { chromium } = require('playwright');
const { spawn } = require('child_process');
const WP = require('./warp.json');
function toOld(T){const N=WP.new,O=WP.old;if(T<=N[0])return O[0];for(let i=1;i<N.length;i++){if(T<=N[i]){const f=(T-N[i-1])/(N[i]-N[i-1]);return O[i-1]+f*(O[i]-O[i-1]);}}return O[O.length-1];}
(async () => {
  const [, , startF, endF, outFile] = process.argv; const FPS = 30;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file://' + __dirname + '/index.html', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', '-tune', 'animation', outFile], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = +startF; f < +endF; f++) {
    await p.evaluate(t => window.seek(t), toOld(f / FPS));
    const buf = await p.screenshot({ type: 'jpeg', quality: 96 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 150 === 0) console.log(outFile, f);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close();
})();
