#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');
const root = path.resolve(__dirname, '..');
const errors = [];
const check = (ok, message) => { if (!ok) errors.push(message); };
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory()
  ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
function frontMatter(file) {
  const text = fs.readFileSync(file, 'utf8');
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error('Missing YAML front matter');
  return { data: yaml.load(match[1]), body: text.slice(match[0].length) };
}
function featureFields(item, file) {
  check(item.featured === undefined || typeof item.featured === 'boolean', `${file}: featured must be true/false, not a quoted string`);
  check(item.featured_order === undefined || Number.isInteger(item.featured_order) && item.featured_order > 0, `${file}: featured_order must be a positive integer`);
}
function image(value, alt, file) {
  if (!value) return;
  check(typeof value === 'string', `${file}: image must be a path or HTTPS URL`);
  if (typeof value !== 'string') return;
  check(typeof alt === 'string' && alt.trim().length > 0, `${file}: image needs alt text`);
  if (value.startsWith('https://')) return;
  check(value.startsWith('/') && !value.startsWith('//'), `${file}: image needs a root-relative path or HTTPS URL`);
  const relative = value.replace(/^\//, '');
  check(['source', 'themes/matery/source'].some(base => fs.existsSync(path.join(root, base, relative))), `${file}: image file does not exist: ${value}`);
}
let postCount = 0;
for (const folder of ['_posts', '_drafts']) for (const file of walk(path.join(root, 'source', folder)).filter(file => file.endsWith('.md'))) {
  const name = path.relative(root, file);
  try {
    const { data, body } = frontMatter(file);
    check(typeof data.title === 'string' && data.title.trim(), `${name}: title required`);
    check(data.date && Number.isFinite(new Date(data.date).valueOf()), `${name}: valid date required`);
    featureFields(data, name);
    for (const field of ['card_title', 'summary', 'cover', 'cover_alt']) check(data[field] === undefined || typeof data[field] === 'string', `${name}: ${field} must be a string`);
    check(data.series_number === undefined || Number.isInteger(data.series_number) && data.series_number > 0, `${name}: series_number must be a positive integer`);
    image(data.cover, data.cover_alt, name);
    for (const match of body.matchAll(/{%\s*htmlblock\s+([^\s%]+)\s*%}/g)) check(fs.existsSync(path.join(root, 'source/_html_blocks', match[1] + '.html')), `${name}: missing HTML block ${match[1]}`);
    postCount++;
  } catch (error) { errors.push(`${name}: ${error.message}`); }
}
const papers = JSON.parse(fs.readFileSync(path.join(root, 'source/_data/research.json'), 'utf8')).papers;
const ids = new Set();
for (const paper of papers) {
  const name = `research:${paper.id || '(missing id)'}`;
  check(typeof paper.id === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(paper.id), `${name}: use a stable lowercase hyphenated id`);
  check(!ids.has(paper.id), `${name}: duplicate id`); ids.add(paper.id);
  for (const field of ['title', 'authors', 'venue', 'doi', 'headline', 'summary', 'topic']) check(typeof paper[field] === 'string' && paper[field].trim(), `${name}: ${field} required`);
  check(Number.isInteger(paper.year), `${name}: year must be an integer`);
  check(paper.status === 'Published', `${name}: this collection is for published papers only`);
  check(typeof paper.url === 'string' && paper.url.startsWith('https://'), `${name}: HTTPS paper URL required`);
  featureFields(paper, name); image(paper.image, paper.image_alt, name);
  if (paper.image) {
    check(typeof paper.image_source === 'string' && paper.image_source.startsWith('https://'), `${name}: image source URL required`);
    check(typeof paper.image_type === 'string' && paper.image_type.trim(), `${name}: identify image type`);
  }
}
const settings = yaml.load(fs.readFileSync(path.join(root, 'source/_data/portfolio.yml'), 'utf8'));
for (const key of ['post_limit', 'research_limit']) check(Number.isInteger(settings.homepage?.[key]) && settings.homepage[key] > 0, `portfolio.homepage.${key}: positive integer required`);
image(settings.stranger_stats?.default_cover, settings.stranger_stats?.default_cover_alt, 'portfolio.stranger_stats');
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`Content metadata verified: ${postCount} posts/drafts and ${papers.length} papers; feature fields, images and HTML blocks valid.`);
