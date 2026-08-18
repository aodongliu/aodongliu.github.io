'use strict';

/**
 * Hexo tag: {% htmlblock name %}
 *
 * Pulls a pre-rendered HTML block from
 * <blog>/source/_html_blocks/<name>.html into a post. Keeps the markdown
 * files short and readable instead of embedding long card/table HTML inline.
 */
const fs = require('fs');
const path = require('path');

hexo.extend.tag.register('htmlblock', function (args) {
  const name = (args[0] || '').trim();
  if (!name) return '';
  const file = path.join(hexo.base_dir, 'source', '_html_blocks', name + '.html');
  try {
    const html = fs.readFileSync(file, 'utf8');
    return html.trim();
  } catch (e) {
    hexo.log.warn('[htmlblock] missing: %s', file);
    return '';
  }
});
