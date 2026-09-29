#!/usr/bin/env node
'use strict';
// Screenshot a page from the local preview so an agent can check its work visually.
//
//   node tools/screenshot.cjs <post-slug | /path/ | URL> [--out <dir>]
//
// Captures desktop (1300px, light) and phone (400px, dark), scrolling first so lazy images
// load, and saves full-page PNGs plus ~1800px tiles that are readable one at a time.
// Reports broken images and horizontal overflow. Needs the preview server
// (node tools/preview.cjs server, or server --drafts for a draft). One-time setup:
// npx playwright install chromium
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const BASE = 'http://127.0.0.1:4100';
const VIEWS = [['desktop', 1300, 'light'], ['phone', 400, 'dark']];
const TILE = 1800;
// The NBA image CDN refuses browsers that announce themselves as headless.
const BROWSER = {
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
  extraHTTPHeaders: { 'sec-ch-ua': '"Chromium";v="140", "Google Chrome";v="140", "Not?A_Brand";v="99"' }
};

// Post slug -> dated URL, read from the Markdown front matter. Drafts are served by the
// drafts preview (node tools/preview.cjs server --drafts) on port 4101.
async function resolve(target) {
  if (/^https?:/.test(target)) return target;
  if (target.startsWith('/')) return BASE + target;
  const slug = target.replace(/\.md$/, '');
  for (const [folder, base] of [['_posts', BASE], ['_drafts', 'http://127.0.0.1:4101']]) {
    const file = path.join(__dirname, '..', 'source', folder, `${slug}.md`);
    if (!fs.existsSync(file)) continue;
    const date = (fs.readFileSync(file, 'utf8').match(/^date:\s*["']?(\d{4})-(\d{1,2})-(\d{1,2})/m) || []).slice(1);
    if (date.length !== 3) throw new Error(`${file} has no parseable date`);
    const [y, m, d] = date;
    return `${base}/${y}/${m.padStart(2, '0')}/${d.padStart(2, '0')}/${slug}/`;
  }
  throw new Error(`No source/_posts or source/_drafts file named ${slug}.md`);
}

(async () => {
  const args = process.argv.slice(2);
  const outIndex = args.indexOf('--out');
  const out = outIndex >= 0 ? args.splice(outIndex, 2)[1] : 'shots';
  if (!args[0]) throw new Error('Usage: node tools/screenshot.cjs <post-slug | /path/ | URL> [--out dir]');
  const url = await resolve(args[0]);
  const name = url.replace(/\/$/, '').split('/').pop().replace(/\W+/g, '_') || 'home';
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  for (const [view, width, theme] of VIEWS) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, ...BROWSER });
    await context.addInitScript(t => localStorage.setItem('aodong-theme-v2', t), theme);
    // Comment widgets keep connections open and are not what this tool checks.
    await context.route(u => /giscus|disqus/.test(u.hostname), r => r.abort());
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'load' });
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); }
      window.scrollTo(0, 0); await document.fonts.ready;
    });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForFunction(() => [...document.querySelectorAll('main img')].every(i => i.complete), null, { timeout: 15000 }).catch(() => {});
    // Retry anything that failed once: the image CDN occasionally drops a burst of requests.
    await page.evaluate(async () => {
      const failed = [...document.querySelectorAll('main img')].filter(i => !i.naturalWidth);
      await Promise.all(failed.map(img => new Promise(done => {
        img.loading = 'eager'; img.onload = img.onerror = done; setTimeout(done, 8000);
        const src = img.src; img.src = ''; img.src = src;
      })));
    });
    // Full-page captures paint off-screen fixed elements (the keyboard-only skip link); hide it.
    await page.addStyleTag({ content: '.skip-link{display:none!important}' });
    const broken = await page.$$eval('main img', imgs => imgs.filter(i => !i.naturalWidth).map(i => i.src));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    const height = await page.evaluate(() => document.body.scrollHeight);
    await page.screenshot({ path: path.join(out, `${name}_${view}.png`), fullPage: true });
    let tiles = 0;
    for (let y = 0; y < height; y += TILE, tiles++) {
      await page.screenshot({ path: path.join(out, `${name}_${view}_t${String(tiles).padStart(2, '0')}.png`), fullPage: true,
        clip: { x: 0, y, width, height: Math.min(TILE, height - y) } });
    }
    console.log(`${view}: ${tiles} tiles in ${out}/ · broken images: ${broken.length} · horizontal overflow: ${overflow}px`);
    for (const src of broken) console.log(`  broken: ${src}`);
    await context.close();
  }
  await browser.close();
})().catch(error => { console.error(error.message); process.exitCode = 1; });
