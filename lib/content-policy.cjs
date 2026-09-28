'use strict';

// Editorial selection rules shared by the theme and focused behavior tests.
// Content itself belongs in Markdown front matter or source/_data, never here.
const rank = item => Number.isFinite(item.featured_order) ? item.featured_order : 100;
const timestamp = item => item.date ? Number(new Date(item.date)) || Number(item.date) || 0 : Number(item.year) || 0;
const key = item => String(item.path || item.id || item.title || '');
const recent = (a, b) => timestamp(b) - timestamp(a) || key(a).localeCompare(key(b));
const featured = (a, b) => rank(a) - rank(b) || recent(a, b);
const published = post => post.published !== false && !/^_drafts\//.test(String(post.source || ''));
const categories = post => Array.isArray(post.categories) ? post.categories : post.categories?.toArray?.() || [];
const isStats = post => categories(post).some(category => (category.name || category) === 'Stranger Stats');

function orderPosts(posts) {
  return posts.filter(published).sort((a, b) => Number(b.featured === true) - Number(a.featured === true)
    || (a.featured === true ? featured(a, b) : recent(a, b)));
}

function homepagePosts(posts, limit = 3) {
  const live = posts.filter(published);
  const chosen = live.filter(post => post.featured === true).sort(featured);
  const recentStats = live.filter(post => isStats(post) && post.featured !== true).sort(recent);
  return [...chosen, ...recentStats].slice(0, limit);
}

function homepagePapers(papers, limit = 3) {
  const live = papers.filter(paper => paper.status === 'Published');
  const chosen = live.filter(paper => paper.featured === true).sort(featured);
  // Within a year, preserve the author's publication order in research.json.
  return (chosen.length ? chosen : [...live].sort((a, b) => b.year - a.year)).slice(0, limit);
}

module.exports = { orderPosts, homepagePosts, homepagePapers, isStats, published };
