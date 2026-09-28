(() => {
  const root = document.documentElement;
  const themeButton = document.querySelector('.theme-toggle');
  function label() { themeButton.setAttribute('aria-label', `Switch to ${root.dataset.theme === 'dark' ? 'light' : 'dark'} theme`); }
  label();
  themeButton.addEventListener('click', () => { root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark'; try { localStorage.setItem('aodong-theme-v2', root.dataset.theme); } catch (_) {} label(); });
  const menuButton = document.querySelector('.menu-toggle');
  menuButton.addEventListener('click', () => { const expanded = menuButton.getAttribute('aria-expanded') !== 'true'; menuButton.setAttribute('aria-expanded', String(expanded)); document.querySelector('.primary-nav').classList.toggle('is-open', expanded); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') { menuButton.setAttribute('aria-expanded', 'false'); document.querySelector('.primary-nav').classList.remove('is-open'); } });
})();
