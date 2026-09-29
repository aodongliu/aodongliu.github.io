'use strict';
// Isolate generated output AND Hexo's cache from the production build in public/.
//   node tools/preview.cjs server            normal preview at http://127.0.0.1:4100
//   node tools/preview.cjs server --drafts   also renders source/_drafts, at http://127.0.0.1:4101
//   node tools/preview.cjs build             build .preview/public for tools/check-preview.cjs
// Drafts mode is for looking at unpublished posts locally. It uses its own port and cache
// and never writes files, so it cannot leak drafts into the checked or deployed output.
const path = require('path');
const fs = require('fs');
const Hexo = require('hexo');
const base = path.resolve(__dirname, '..');
const command = process.argv[2] || 'server';
const drafts = process.argv.includes('--drafts');
if (!['build', 'server'].includes(command)) throw new Error('Use: node tools/preview.cjs [build|server] [--drafts]');
if (drafts && command !== 'server') throw new Error('--drafts is only for the local server; builds never include drafts');
const cacheDir = path.join(base, drafts ? '.preview-drafts' : '.preview');
fs.mkdirSync(cacheDir, { recursive: true });
const hexo = new Hexo(base, { config: '_config.yml,_config.preview.yml', output: cacheDir, draft: drafts });
(async () => {
  await hexo.init();
  if (!hexo.config.portfolio_preview || hexo.config.theme !== 'matery') throw new Error('Preview configuration was not loaded');
  if (drafts) {
    hexo.config.render_drafts = true;
    hexo.config.exclude = (hexo.config.exclude || []).filter(pattern => !/_drafts/.test(pattern));
  }
  if (command === 'build') {
    await hexo.call('generate', {});
    await hexo.exit();
  } else {
    await hexo.call('server', { port: drafts ? 4101 : 4100, ip: '127.0.0.1' });
  }
})().catch(async error => { console.error(error); await hexo.exit(error); process.exitCode = 1; });
