'use strict';
const path = require('path');
const policy = require(path.join(hexo.base_dir, 'lib/content-policy.cjs'));

hexo.extend.generator.register('portfolio', function (locals) {
  const data = locals.data.research || { papers: [] };
  const papers = Array.isArray(data) ? data : data.papers;
  const settings = locals.data.portfolio || {};
  const posts = locals.posts.toArray();
  const selectedPosts = policy.homepagePosts(posts.filter(policy.isStats), settings.homepage?.post_limit ?? 3);
  const selectedPapers = policy.homepagePapers(papers, settings.homepage?.research_limit ?? 3);
  const pages = [
    { path: 'index.html', layout: ['portfolio'], data: { title: '', papers, selectedPosts, selectedPapers, description: hexo.config.description } },
    { path: 'research/index.html', layout: ['research'], data: { title: 'Research', papers, description: 'Quantum dynamics and electronic structure: research papers by Aodong Liu, explained for curious readers.' } },
    { path: '404.html', layout: ['404'], data: { title: 'Page not found' } },
    { path: 'robots.txt', data: hexo.config.portfolio_preview ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nSitemap: ${new URL('sitemap.xml', hexo.config.url).href}\n` }
  ];
  for (const paper of papers) pages.push({ path: `research/${paper.id}/index.html`, layout: ['paper'], data: { title: paper.headline || paper.title, paper, description: paper.summary } });
  return pages;
});

hexo.extend.helper.register('post_card', function (post) {
  const stats = policy.isStats(post);
  const defaults = this.site.data.portfolio?.stranger_stats || {};
  const categoryNames = post.categories?.toArray?.().map(category => category.name) || [];
  return {
    number: stats ? post.series_number || (post.title.match(/#(\d+)/) || [])[1] || '' : '',
    title: stats ? post.title : post.card_title || post.title,
    summary: stats ? '' : post.summary || this.strip_html(post.excerpt || '').trim().slice(0, 180),
    cover: post.cover || (stats ? defaults.default_cover : '') || '',
    cover_alt: post.cover_alt || (stats ? defaults.default_cover_alt : '') || '',
    label: stats ? 'Stranger Stats' : categoryNames[0] || 'Writing',
    featured: post.featured === true
  };
});

hexo.extend.helper.register('ordered_stats_posts', function () {
  return policy.orderPosts(this.site.posts.toArray().filter(policy.isStats));
});

hexo.extend.filter.register('after_generate', function () {
  // Keep unused upstream integrations and stock photography out of this preview.
  for (const route of hexo.route.list()) {
    if (/^(medias\/|libs\/|css\/|js\/)/.test(route) && !/^(css\/(site|article)\.css|js\/(site|article)\.js)$/.test(route)) hexo.route.remove(route);
  }
});

// The stock sitemap only sees posts/pages, not generated research routes.
hexo.extend.filter.register('after_generate', async function () {
  const stream = hexo.route.get('sitemap.xml');
  if (!stream) return;
  let xml = '';
  for await (const chunk of stream) xml += chunk.toString();
  const escapeXml = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const routes = hexo.route.list().filter(route => /^research\/(?:[^/]+\/)?index\.html$/.test(route));
  const entries = routes.map(route => escapeXml(new URL(route.replace(/index\.html$/, ''), hexo.config.url).href))
    .filter(url => !xml.includes(`<loc>${url}</loc>`))
    .map(url => `  <url><loc>${url}</loc></url>`).join('\n');
  hexo.route.set('sitemap.xml', xml.replace('</urlset>', entries + '\n</urlset>'));
});
