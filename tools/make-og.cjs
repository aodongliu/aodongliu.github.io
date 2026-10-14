#!/usr/bin/env node
'use strict';
// Renders the 1200x630 link-preview images (Open Graph) for the homepage, Research and
// Stranger Stats into source/images/og/. Uses the site's own font, Lagoon colors and real
// photos/artwork. Re-run after changing a title, the portrait or the banners:
//   node tools/make-og.cjs
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const out = path.join(root, 'source/images/og');
const asset = rel => 'data:image/' + (rel.endsWith('.png') ? 'png' : rel.endsWith('.webp') ? 'webp' : 'jpeg') + ';base64,' + fs.readFileSync(path.join(root, rel)).toString('base64');
const font = 'data:font/woff2;base64,' + fs.readFileSync(path.join(root, 'themes/matery/source/fonts/Geist-Variable.woff2')).toString('base64');

const base = `
@font-face{font-family:Geist;src:url(${font}) format("woff2");font-weight:100 900}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;font-family:Geist,sans-serif;color:#0d1d22;overflow:hidden;
  background:#fbfefe radial-gradient(900px 520px at 100% 0%,#d6f1f0 0,transparent 62%),radial-gradient(800px 540px at 0% 100%,#dce9fb 0,transparent 62%)}
.grad{background:linear-gradient(90deg,#0f8f8a,#2a7fd4 55%,#4b54c9);-webkit-background-clip:text;background-clip:text;color:transparent}
.url{position:absolute;left:72px;bottom:56px;font-size:24px;color:#56686e;letter-spacing:-.01em}
.logo{position:absolute;left:72px;top:60px;width:64px;height:64px}`;

const cards = {
  home: `<style>${base}
    h1{position:absolute;left:72px;top:170px;font-size:88px;font-weight:650;letter-spacing:-.045em;line-height:1}
    h2{position:absolute;left:72px;top:272px;font-size:64px;font-weight:600;letter-spacing:-.04em;line-height:1.05}
    p{position:absolute;left:72px;top:372px;width:600px;font-size:28px;line-height:1.45;color:#56686e}
    .photo{position:absolute;right:72px;top:75px;width:380px;height:480px;border-radius:28px;object-fit:cover;object-position:50% 45%;box-shadow:0 20px 50px #0f4f5530}</style>
    <img class="logo" src="${asset('source/images/al_logo.png')}"><h1>Aodong Liu</h1><h2 class="grad">Computational chemist</h2>
    <p>Quantum chemistry methods, scalable scientific software, and NBA data stories.</p>
    <img class="photo" src="${asset('source/images/headshot_lincolnPark.png')}"><div class="url">aodongliu.github.io</div>`,
  research: `<style>${base}
    body{background:#0d1d22}.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 60%}
    .shade{position:absolute;inset:0;background:linear-gradient(90deg,#061417e6,#06141780 55%,#06141700)}
    h1{position:absolute;left:72px;top:150px;font-size:110px;font-weight:650;letter-spacing:-.045em;color:#fff}
    p{position:absolute;left:72px;top:290px;width:640px;font-size:30px;line-height:1.4;color:#e6f4f4}
    .pills{position:absolute;left:72px;top:400px;display:flex;flex-wrap:wrap;gap:12px;width:720px}
    .pills span{padding:6px 18px;border-radius:999px;font-size:22px;font-weight:550}
    .c{background:#e3ecff;color:#1d4fbf}.m{background:#efe6ff;color:#6a3db5}.s{background:#ddf3e8;color:#17704b}
    .url{color:#c6e0e2}</style>
    <img class="bg" src="${asset('source/images/north-cascades.jpg')}"><div class="shade"></div>
    <h1>Research</h1><p>Aodong Liu · Quantum chemistry and scientific computing</p>
    <div class="pills"><span class="c">HPC</span><span class="c">Distributed Computing</span><span class="c">GPU</span><span class="m">Numerical Optimization</span><span class="s">Nuclear Quantum Effects</span></div>
    <div class="url">aodongliu.github.io/research</div>`,
  'stranger-stats': `<style>${base}
    body{background:#0d1d22}.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
    .shade{position:absolute;inset:0;background:linear-gradient(90deg,#000000d9,#00000066 60%,#00000000)}
    h1{position:absolute;left:72px;top:190px;font-size:104px;font-weight:650;letter-spacing:-.045em;color:#fff}
    p{position:absolute;left:72px;top:320px;width:620px;font-size:32px;line-height:1.4;color:#f1ece6}
    .url{color:#d9d4cc}</style>
    <img class="bg" src="${asset('source/images/strangerStats_chatgpt3.png')}"><div class="shade"></div>
    <h1>Stranger Stats</h1><p>NBA data stories that might shock you.</p><div class="url">aodongliu.github.io/strangerStats</div>`
};

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  for (const [name, html] of Object.entries(cards)) {
    await page.setContent(`<!doctype html><meta charset="utf-8">${html}`, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(out, `${name}.jpg`), type: 'jpeg', quality: 86 });
    console.log(`source/images/og/${name}.jpg`);
  }
  await browser.close();
})().catch(error => { console.error(error); process.exitCode = 1; });
