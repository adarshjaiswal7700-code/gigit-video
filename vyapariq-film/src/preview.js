const { chromium } = require('playwright');
const WP = require('./warp.json');
function toOld(T){const N=WP.new,O=WP.old;if(T<=N[0])return O[0];for(let i=1;i<N.length;i++){if(T<=N[i]){const f=(T-N[i-1])/(N[i]-N[i-1]);return O[i-1]+f*(O[i]-O[i-1]);}}return O[O.length-1];}
(async () => {
  const dir = process.argv[2]; const times = process.argv.slice(3).map(Number);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('console', m => console.log('console:', m.text())); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file://' + __dirname + '/index.html', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  for (const t of times) { await p.evaluate(t => window.seek(t), toOld(t)); await p.screenshot({ path: `${dir}/p_${t.toFixed(1).padStart(5,'0')}.jpg`, quality: 80 }); }
  await b.close();
})();
