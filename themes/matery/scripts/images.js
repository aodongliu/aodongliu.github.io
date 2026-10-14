'use strict';
// Build-time image optimization. Templates call opt_img('/images/x.png', 480) and get
// '/optimized/w480/images/x.webp'; this generator serves every local raster image at the
// widths below, resized and converted to WebP with sharp. Nothing is committed: new images
// are optimized automatically. Results are cached in .cache/optimized (keyed by file size and
// modification time) so rebuilds are fast. Originals are still published for full-size links.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const WIDTHS = [96, 480, 960, 1600];
const ROOTS = [
  { dir: path.join(hexo.base_dir, 'source', 'images'), url: '/images/' },
  { dir: path.join(hexo.theme_dir, 'source', 'portfolio'), url: '/portfolio/' }
];
const CACHE = path.join(hexo.base_dir, '.cache', 'optimized');
const RASTER = /\.(png|jpe?g|webp)$/i;

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
}

function sourceFile(src) {
  const root = ROOTS.find(r => String(src || '').startsWith(r.url));
  if (!root || !RASTER.test(src)) return null;
  const file = path.join(root.dir, decodeURIComponent(src.slice(root.url.length)));
  return fs.existsSync(file) ? file : null;
}

function optimizedUrl(src, width) {
  return `/optimized/w${width}${String(src).replace(RASTER, '.webp')}`;
}

let sharp;
async function render(file, width) {
  const stat = fs.statSync(file);
  const key = crypto.createHash('sha1').update(`${file}|${stat.size}|${stat.mtimeMs}|${width}|v1`).digest('hex');
  const cached = path.join(CACHE, `${key}.webp`);
  if (fs.existsSync(cached)) return fs.readFileSync(cached);
  sharp = sharp || require('sharp');
  const buffer = await sharp(file).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 80, effort: 5 }).toBuffer();
  fs.mkdirSync(CACHE, { recursive: true });
  fs.writeFileSync(cached, buffer);
  return buffer;
}

// opt_img(src, width): optimized URL for a local raster image, or src unchanged otherwise.
hexo.extend.helper.register('opt_img', function (src, width) {
  if (!WIDTHS.includes(width)) throw new Error(`opt_img width must be one of ${WIDTHS.join(', ')}`);
  return sourceFile(src) ? optimizedUrl(src, width) : src;
});

hexo.extend.generator.register('optimized_images', function () {
  const routes = [];
  for (const root of ROOTS) for (const file of walk(root.dir).filter(f => RASTER.test(f))) {
    const src = root.url + path.relative(root.dir, file).split(path.sep).join('/');
    for (const width of WIDTHS) routes.push({ path: optimizedUrl(src, width).slice(1), data: () => render(file, width) });
  }
  // Browser-tab and home-screen icons from the logo.
  const logo = path.join(hexo.base_dir, 'source', 'images', 'al_logo.png');
  if (fs.existsSync(logo)) {
    const icon = (size, pad, bg) => async () => {
      sharp = sharp || require('sharp');
      const inner = Math.round(size * (1 - 2 * pad));
      const mark = await sharp(logo).resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
      return sharp({ create: { width: size, height: size, channels: 4, background: bg } }).composite([{ input: mark, gravity: 'center' }]).png().toBuffer();
    };
    const clear = { r: 0, g: 0, b: 0, alpha: 0 };
    routes.push({ path: 'favicon-32.png', data: icon(32, 0, clear) });
    routes.push({ path: 'favicon-16.png', data: icon(16, 0, clear) });
    routes.push({ path: 'apple-touch-icon.png', data: icon(180, 0.14, { r: 255, g: 255, b: 255, alpha: 1 }) });
  }
  return routes;
});

// Images written in post Markdown (e.g. ![](/images/x.png)) load a 1600px WebP; the link
// around them, if any, still points at the original.
hexo.extend.filter.register('after_post_render', function (data) {
  data.content = data.content.replace(/(<img\b[^>]*?\ssrc=")(\/(?:images|portfolio)\/[^"]+\.(?:png|jpe?g))(")/gi,
    (match, before, src, after) => sourceFile(src) ? `${before}${optimizedUrl(src, 1600)}${after}` : match);
  return data;
});
