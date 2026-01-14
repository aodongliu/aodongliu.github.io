---
title: Stranger Stats
layout: page
banner_img: /images/strangerStats_chatgpt3.png
banner_img_height: 70
banner_mask_alpha: 0.3

---

<div style="text-align: center; margin-bottom: 3rem;">
  <p style="font-size: 1.1rem; color: var(--sec-text-color); max-width: 600px; margin: 0 auto;">
    Welcome to <strong><em>Stranger Stats</em></strong>, where we track down the <strong><em>unusual suspects</em></strong> who somehow hold the <strong><em>most unexpected records</em></strong>. Some of these stats are so shocking, you'll think they came straight from the Upside Down.
  </p>
  </p>
  <p style="font-size: 1.1rem; color: var(--sec-text-color); max-width: 600px; margin: 1.5rem auto 0 auto;">
    Starting from Jan. 2026, I plan to post here every Monday till I run out of "Stranger ideas". What stats do you want to see? Reach out to <a href="/about/" style="font-weight: 600; color: #337ab7; text-decoration: none;">me</a>.
  </p>
</div>


<hr style="margin: 2rem 0; opacity: 0.2;">

## All Posts

<div id="posts" style="margin-top: 2rem;">
  <div style="text-align: center; color: var(--sec-text-color);">
    <i class="iconfont icon-loading" style="font-size: 2rem;"></i>
    <p>Loading posts...</p>
  </div>
</div>

<style>
.stranger-post {
  margin-bottom: 2rem;
  padding: 0;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  background: var(--board-color);
  border-left: 4px solid #337ab7;
}

.stranger-post:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.stranger-post-content {
  padding: 1.5rem;
}

.stranger-post h3 {
  margin: 0 0 0.75rem 0;
  font-size: 1.4rem;
  line-height: 1.4;
}

.stranger-post h3 a {
  text-decoration: none;
  color: var(--post-heading-color);
  transition: color 0.2s ease;
}

.stranger-post h3 a:hover {
  color: var(--link-hover-color);
}

.stranger-post-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--sec-text-color);
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.stranger-post-excerpt {
  color: var(--text-color);
  font-size: 0.95rem;
  line-height: 1.6;
  margin-top: 0.75rem;
}

.no-posts-message {
  text-align: center;
  padding: 3rem;
  color: var(--sec-text-color);
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .stranger-post h3 {
    font-size: 1.2rem;
  }
  
  .stranger-post-content {
    padding: 1.25rem;
  }
}
</style>

<script>
fetch('/stranger-stats-posts.json')
  .then(res => res.json())
  .then(posts => {
    const container = document.getElementById('posts');
    
    if (posts.length === 0) {
      container.innerHTML = '<div class="no-posts-message">No Stranger Stats posts found yet. Check back soon!</div>';
      return;
    }
    
    container.innerHTML = posts.map(post => `
      <article class="stranger-post">
        <div class="stranger-post-content">
          <h3>
            <a href="/${post.path}">${post.title}</a>
          </h3>
          <div class="stranger-post-meta">
            <i class="iconfont icon-date-fill"></i>
            <time datetime="${post.date}">${post.date}</time>
          </div>
          ${post.excerpt ? `<div class="stranger-post-excerpt">${post.excerpt}</div>` : ''}
        </div>
      </article>
    `).join('');
  })
  .catch(err => {
    document.getElementById('posts').innerHTML = `
      <div class="no-posts-message">
        <i class="iconfont icon-warning" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
        Error loading posts. Please refresh the page.
      </div>
    `;
    console.error('Failed to load Stranger Stats posts:', err);
  });
</script>
