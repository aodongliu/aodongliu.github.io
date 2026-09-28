#!/usr/bin/env node
'use strict';
// Validate publication boundaries and generated navigation, independent of theme styling.
const fs = require('node:fs');
const path = require('node:path');
const { Parser } = require('htmlparser2');
const yaml = require('js-yaml');
const root = path.resolve(__dirname, '..');
const output = path.resolve(root, process.argv[2] || '.preview/public');
const production = process.argv.includes('--production');
const errors = [];
const check = (condition, message) => { if (!condition) errors.push(message); };
const walk = dir => fs.readdirSync(dir, {withFileTypes: true}).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
const htmlFiles = walk(output).filter(f => f.endsWith('.html'));
const documents = new Map();
const config = yaml.load(fs.readFileSync(path.join(root, '_config.yml'), 'utf8'));
const exportRoots = (config.skip_render || []).filter(pattern => pattern.endsWith('/**')).map(pattern => pattern.slice(0, -3));
for (const dir of exportRoots) {
  const source = path.join(root, 'source', dir);
  if (!fs.existsSync(source)) continue;
  for (const sourceFile of walk(source)) {
    const target = path.join(output, path.relative(path.join(root, 'source'), sourceFile));
    check(fs.existsSync(target) && fs.readFileSync(target).equals(fs.readFileSync(sourceFile)), `Static app export changed or missing: ${target}`);
  }
}
for (const file of htmlFiles) {
  const relative = path.relative(output, file).split(path.sep).join('/');
  const route = '/' + relative.replace(/index\.html$/, '');
  const doc = {route, file, links: [], ids: new Set(), canonicals: [], noindex: false, html: fs.readFileSync(file, 'utf8')};
  const parser = new Parser({onopentag(name, attrs) {
    if (attrs.id) doc.ids.add(attrs.id);
    if (name === 'link' && attrs.rel === 'canonical') doc.canonicals.push(attrs.href);
    if (name === 'meta' && attrs.name === 'robots' && /noindex/.test(attrs.content || '')) doc.noindex = true;
    for (const key of ['href', 'src']) if (attrs[key]) doc.links.push(attrs[key]);
  }});
  parser.write(doc.html); parser.end(); documents.set(file, doc);
  if (exportRoots.some(dir => relative.startsWith(dir + '/'))) continue; // Independently built apps retain their own document metadata.
  check(production ? !doc.noindex : doc.noindex, `${route}: incorrect robots policy for ${production ? 'production' : 'preview'}`);
  check(!/author[- ]supplied|placeholder|TODO/i.test(doc.html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<!--[^]*?-->/g, '')), `${route}: internal editorial label leaked into output`);
  check(doc.canonicals.length === 1, `${route}: expected one canonical`);
  check(doc.canonicals[0] === 'https://aodongliu.github.io' + route, `${route}: incorrect canonical ${doc.canonicals[0]}`);
  check(!/{%\s*htmlblock/.test(doc.html), `${route}: unresolved HTML block tag`);
}
let checkedLinks = 0;
for (const doc of documents.values()) for (const href of doc.links) {
  if (/^(?:https?:|mailto:|tel:|data:|javascript:|\/\/)/i.test(href)) continue;
  const url = new URL(href, 'https://preview.invalid' + doc.route);
  let local = path.join(output, decodeURIComponent(url.pathname));
  if (fs.existsSync(local) && fs.statSync(local).isDirectory()) local = path.join(local, 'index.html');
  checkedLinks++;
  check(fs.existsSync(local), `${doc.route}: missing local target ${href}`);
  if (url.hash && documents.has(local)) check(documents.get(local).ids.has(decodeURIComponent(url.hash.slice(1))), `${doc.route}: missing anchor ${href}`);
}
const papers = JSON.parse(fs.readFileSync(path.join(root, 'source/_data/research.json'), 'utf8')).papers;
for (const paper of papers) check(fs.existsSync(path.join(output, 'research', paper.id, 'index.html')), `Missing research page ${paper.id}`);
const stats = JSON.parse(fs.readFileSync(path.join(output, 'stranger-stats-posts.json'), 'utf8'));
const sourcePosts = walk(path.join(root, 'source/_posts')).filter(file => file.endsWith('.md')).map(file => {
  const text = fs.readFileSync(file, 'utf8');
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return { ...yaml.load(match[1]), body: text.slice(match[0].length) };
});
const expectedStats = sourcePosts.filter(post => post.published !== false && [].concat(post.categories || []).includes('Stranger Stats'));
check(stats.length === expectedStats.length, `Expected ${expectedStats.length} Stranger Stats from source, found ${stats.length}`);
for (const post of stats) check(fs.existsSync(path.join(output, post.path, 'index.html')) || fs.existsSync(path.join(output, post.path)), `Missing post ${post.path}`);
const searchable = [...documents.values()].map(d => d.html).join('\n') + JSON.stringify(stats) + fs.readFileSync(path.join(output, 'sitemap.xml'), 'utf8');
for (const draft of fs.readdirSync(path.join(root, 'source/_drafts')).filter(f => f.endsWith('.md'))) check(!searchable.includes(draft.slice(0, -3)), `Draft leaked: ${draft}`);
check(!walk(output).some(f => /\/_html_blocks\//.test(f.split(path.sep).join('/'))), 'Raw HTML blocks should not be published separately');
const expectedBlocks = sourcePosts.filter(post => post.published !== false).reduce((sum, post) => sum + (post.body.match(/{%\s*htmlblock\s/g) || []).length, 0);
const renderedBlocks = [...documents.values()].filter(doc => /^\/\d{4}\/\d{2}\/\d{2}\//.test(doc.route)).reduce((sum, doc) => sum + (doc.html.match(/class="legacy-html-block"/g) || []).length, 0);
check(renderedBlocks === expectedBlocks, `Expected ${expectedBlocks} embedded HTML panels from source, found ${renderedBlocks}`);
const robots = fs.readFileSync(path.join(output, 'robots.txt'), 'utf8');
check(production ? !/^Disallow:\s*\/\s*$/m.test(robots) : /^Disallow:\s*\/\s*$/m.test(robots), 'Incorrect robots.txt publication policy');
const cv = fs.readFileSync(path.join(output, 'files/aodongliu_cv.pdf'));
check(cv.subarray(0, 5).toString() === '%PDF-', 'CV output is not a PDF');
check(cv.equals(fs.readFileSync(path.join(root, 'source/files/aodongliu_cv.pdf'))), 'CV differs from source artifact');
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`${production ? 'Production' : 'Preview'} verified: ${htmlFiles.length} HTML pages; ${checkedLinks} local links; ${papers.length} papers; ${stats.length} Stranger Stats; drafts excluded; canonical URLs, data panels, and CV intact.`);
