'use strict';
// Older generated blocks hard-code a light palette in inline styles, so they sit inside a
// light .legacy-html-block panel. Blocks built from ss-* components (toolkit/ssblocks.py)
// follow the site theme and are left unwrapped.
const fs = require('fs');
const path = require('path');

hexo.extend.filter.register('before_post_render', function (data) {
  data.content = data.content.replace(/({%\s*htmlblock\s+([^\s%]+)\s*%})/g, (tag, _, name) => {
    let html = '';
    try { html = fs.readFileSync(path.join(hexo.base_dir, 'source', '_html_blocks', name + '.html'), 'utf8'); } catch (_) {}
    return /class="[^"]*\bss-block\b/.test(html) ? tag : `<div class="legacy-html-block">\n${tag}\n</div>`;
  });
  return data;
});
