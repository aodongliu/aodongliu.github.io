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
  // Client-side search index (the Matery search modal reads this instead of search.xml).
  const entities = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", nbsp: ' ' };
  const stripHtml = value => String(value || '')
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]*>/g, ' ')
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (_, name) => entities[name]).replace(/\s+/g, ' ').trim();
  const names = list => list?.toArray?.().map(item => item.name) || [];
  const searchEntries = [
    ...posts.filter(policy.published).sort((a, b) => b.date - a.date).map(post => ({
      title: post.title,
      url: `/${post.path.replace(/^\/+/, '').replace(/index\.html$/, '')}`,
      type: names(post.categories)[0] || 'Writing',
      date: post.date.format('YYYY-MM-DD'),
      tags: names(post.tags),
      text: [post.summary, stripHtml(post.content)].filter(Boolean).join(' ').slice(0, 20000)
    })),
    ...papers.map(paper => ({
      title: paper.headline || paper.title,
      url: `/research/${paper.id}/`,
      type: 'Research',
      date: String(paper.year || ''),
      tags: [paper.topic, paper.venue].filter(Boolean),
      text: [paper.title, paper.summary, paper.authors, paper.venue, paper.citation, stripHtml(paper.abstract)].filter(Boolean).join(' ').slice(0, 20000)
    }))
  ];
  const pages = [
    { path: 'index.html', layout: ['portfolio'], data: { title: '', papers, selectedPosts, selectedPapers, description: hexo.config.description } },
    { path: 'research/index.html', layout: ['research'], data: { title: 'Research', papers, description: 'Quantum dynamics and electronic structure: research papers by Aodong Liu, explained for curious readers.' } },
    { path: '404.html', layout: ['404'], data: { title: 'Page not found' } },
    { path: 'search.json', data: JSON.stringify(searchEntries) },
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

// Stable warm tint (0-5) for Matery-style tag and category chips.
hexo.extend.helper.register('taxonomy_tint', function (name) {
  let hash = 0x811c9dc5; // FNV-1a spreads short names across tints better than a Java-style hash.
  for (const char of String(name)) hash = Math.imul(hash ^ char.codePointAt(0), 0x01000193);
  return (hash >>> 0) % 6;
});

// Matery archive calendar: 53 Sunday-first weeks ending at build time, in the site timezone.
hexo.extend.helper.register('post_calendar', function (posts) {
  const day = 86400000;
  const iso = value => new Date(value).toISOString().slice(0, 10);
  const byDate = new Map();
  for (const post of posts) {
    const key = post.date.clone().tz(hexo.config.timezone || 'UTC').format('YYYY-MM-DD');
    byDate.set(key, [...(byDate.get(key) || []), { title: post.title, path: this.url_for(post.path) }]);
  }
  const today = Date.parse(this.date(Date.now(), 'YYYY-MM-DD') + 'T00:00:00Z');
  const start = today - (new Date(today).getUTCDay() + 52 * 7) * day;
  const weeks = [], months = [];
  for (let time = start, col = 0; time <= today; col++) {
    const week = [];
    for (let row = 0; row < 7; row++, time += day) {
      if (time > today) { week.push(null); continue; }
      const date = iso(time);
      if (date.endsWith('-01') || (col === 0 && row === 0)) months.push({ col, label: new Date(time).toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }) });
      week.push({ date, posts: byDate.get(date) || [] });
    }
    weeks.push(week);
  }
  // Drop a leading partial-month label when the next month starts within two weeks.
  if (months.length > 1 && months[1].col - months[0].col < 3) months.shift();
  const total = weeks.flat().filter(Boolean).reduce((sum, cell) => sum + cell.posts.length, 0);
  return { weeks, months, total, start: iso(start), end: iso(today) };
});
