hexo.extend.generator.register('stranger-stats-data', function(locals) {
  // Generate a JSON file with Stranger Stats posts
  const posts = locals.posts.filter(post => {
    return post.categories && post.categories.data &&
           post.categories.data.some(cat => cat.name === 'Stranger Stats');
  }).sort('-date').map(post => ({
    title: post.title,
    path: post.path,
    date: post.date.format('YYYY-MM-DD'),
    excerpt: post.excerpt || ''
  }));

  return {
    path: 'stranger-stats-posts.json',
    data: JSON.stringify(posts)
  };
});
