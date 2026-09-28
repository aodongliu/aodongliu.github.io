'use strict';
// Isolate generated output AND Hexo's cache from the existing Fluid checkout.
const path = require('path');
const fs = require('fs');
const Hexo = require('hexo');
const base = path.resolve(__dirname, '..');
const command = process.argv[2] || 'server';
if (!['build', 'server'].includes(command)) throw new Error('Use: node tools/preview.cjs [build|server]');
fs.mkdirSync(path.join(base, '.preview'), { recursive: true });
const hexo = new Hexo(base, { config: '_config.yml,_config.preview.yml', output: path.join(base, '.preview') });
(async () => {
  await hexo.init();
  if (!hexo.config.portfolio_preview || hexo.config.theme !== 'matery') throw new Error('Preview configuration was not loaded');
  if (command === 'build') {
    await hexo.call('generate', {});
    await hexo.exit();
  } else {
    await hexo.call('server', { port: 4100, ip: '127.0.0.1' });
  }
})().catch(async error => { console.error(error); await hexo.exit(error); process.exitCode = 1; });
