'use strict';
// Theme-local presentation wrapper; original Markdown and generated tables stay intact.
hexo.extend.filter.register('before_post_render', function (data) {
  data.content = data.content.replace(/({%\s*htmlblock\s+[^%]+%})/g,
    '<div class="legacy-html-block">\n$1\n</div>');
  return data;
});
