'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { homepagePosts, homepagePapers, orderPosts } = require('../lib/content-policy.cjs');
const post = (id, fields = {}) => ({ path: id, source: `_posts/${id}.md`, categories: ['Stranger Stats'], date: '2026-01-01', ...fields });

test('newly authored metadata highlights any post without a hardcoded lookup', () => {
  const items = [post('newest', { date: '2026-09-01' }), post('older-game', { categories: ['Games'], featured: true, featured_order: 1 }), post('second', { featured: true, featured_order: 2 })];
  assert.deepEqual(homepagePosts(items).map(item => item.path), ['older-game', 'second', 'newest']);
});
test('featured drafts never leak and a featured post does not appear twice as filler', () => {
  const items = [post('draft', { source: '_drafts/draft.md', featured: true }), post('hidden', { published: false, featured: true }), post('live', { featured: true }), post('recent')];
  assert.deepEqual(homepagePosts(items).map(item => item.path), ['live', 'recent']);
});
test('unfeaturing restores date order; rank only applies to featured items', () => {
  const items = [post('old', { featured_order: 1 }), post('new', { date: '2026-09-01', featured_order: 100 })];
  assert.deepEqual(orderPosts(items).map(item => item.path), ['new', 'old']);
  assert.equal(items[0].path, 'old', 'selection must not mutate its input');
});
test('ties, overflow, and homepage limits are deterministic', () => {
  const items = [post('z', { featured: true }), post('a', { featured: true }), post('priority', { featured: true, featured_order: 1 })];
  assert.deepEqual(homepagePosts(items, 2).map(item => item.path), ['priority', 'a']);
});
test('research selection is explicit, with a newest-published fallback', () => {
  const papers = [{ id: 'old', year: 2022, status: 'Published' }, { id: 'new', year: 2026, status: 'Published' }, { id: 'pending', year: 2027, status: 'Submitted', featured: true }];
  assert.deepEqual(homepagePapers(papers, 1).map(item => item.id), ['new']);
  papers[0].featured = true;
  assert.deepEqual(homepagePapers(papers, 3).map(item => item.id), ['old']);
});
test('unfeatured papers in the same year retain the supplied publication chronology', () => {
  const papers = ['z-latest', 'a-earlier'].map(id => ({ id, year: 2026, status: 'Published' }));
  assert.equal(homepagePapers(papers, 1)[0].id, 'z-latest');
});
