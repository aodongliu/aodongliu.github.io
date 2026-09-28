#!/usr/bin/env node
'use strict';
// Publish validated output without force-pushing or dropping newer releases.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const yaml = require('js-yaml');
const root = path.resolve(__dirname, '..');
const config = yaml.load(fs.readFileSync(path.join(root, '_config.yml'), 'utf8'));
const { repo, branch } = config.deploy || {};
if (!repo || !branch) throw new Error('Explicit deploy.repo and deploy.branch are required');
const output = path.join(root, 'public');
const checkout = path.join(root, '.deploy_git');
const run = (command, args, cwd = root) => execFileSync(command, args, { cwd, stdio: 'inherit' });
run(process.execPath, ['tools/check-preview.cjs', 'public', '--production']);
if (!fs.existsSync(path.join(checkout, '.git'))) {
  if (fs.existsSync(checkout)) throw new Error('Existing deploy directory is not a Git checkout');
  run('git', ['clone', '--single-branch', '--branch', branch, repo, checkout]);
}
const dirty = execFileSync('git', ['status', '--porcelain'], {cwd: checkout, encoding: 'utf8'}).trim();
if (dirty) throw new Error('Deploy checkout contains local changes; inspect it before publishing');
run('git', ['fetch', repo, branch], checkout);
run('git', ['merge', '--ff-only', 'FETCH_HEAD'], checkout);
for (const entry of fs.readdirSync(checkout)) {
  if (entry !== '.git') fs.rmSync(path.join(checkout, entry), {recursive: true, force: true});
}
for (const entry of fs.readdirSync(output)) {
  if (entry === '.git') throw new Error('Generated output must not contain .git');
  fs.cpSync(path.join(output, entry), path.join(checkout, entry), {recursive: true});
}
run('git', ['add', '-A'], checkout);
const staged = execFileSync('git', ['diff', '--cached', '--name-only'], {cwd: checkout, encoding:'utf8'}).trim();
if (staged) run('git', ['commit', '-m', config.deploy.message || 'Update website'], checkout);
run('git', ['push', repo, `HEAD:${branch}`], checkout);
