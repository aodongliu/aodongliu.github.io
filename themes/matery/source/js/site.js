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

// Matery-style search modal: lazy-loads /search.json on first open.
(() => {
  const dialog = document.getElementById('search-dialog');
  const toggle = document.querySelector('.search-toggle');
  if (!dialog || !toggle) return;
  const input = dialog.querySelector('input');
  const status = dialog.querySelector('.search-status');
  const list = dialog.querySelector('.search-results');
  let entries = null;
  const fold = value => String(value || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const load = () => entries || (entries = fetch('/search.json').then(r => r.ok ? r.json() : Promise.reject())
    .then(data => data.map(entry => ({ ...entry, hay: fold([entry.title, entry.type, (entry.tags || []).join(' '), entry.text].join(' ')), foldTitle: fold(entry.title) }))));
  // Append text with each keyword occurrence wrapped in <mark>; no HTML is parsed.
  const highlight = (parent, text, words) => {
    const folded = fold(text); let at = 0;
    while (at < text.length) {
      let next = -1, len = 0;
      for (const word of words) { const i = folded.indexOf(word, at); if (i >= 0 && (next < 0 || i < next)) { next = i; len = word.length; } }
      if (next < 0) { parent.append(text.slice(at)); break; }
      parent.append(text.slice(at, next));
      const mark = document.createElement('mark'); mark.textContent = text.slice(next, next + len); parent.append(mark);
      at = next + len;
    }
  };
  const snippet = (entry, words) => {
    const text = entry.text || ''; const folded = fold(text);
    const hit = Math.min(...words.map(w => folded.indexOf(w)).filter(i => i >= 0));
    if (!Number.isFinite(hit)) return text.slice(0, 160) + (text.length > 160 ? '…' : '');
    const start = Math.max(0, hit - 60);
    return (start ? '…' : '') + text.slice(start, start + 180).trim() + (start + 180 < text.length ? '…' : '');
  };
  const render = () => {
    const words = fold(input.value).split(/[\s-]+/).filter(Boolean);
    list.replaceChildren();
    if (!words.length) { status.textContent = 'Type to search posts and research.'; return; }
    load().then(data => {
      const hits = data.filter(e => words.every(w => e.hay.includes(w)))
        .map(e => ({ e, score: words.filter(w => e.foldTitle.includes(w)).length }))
        .sort((a, b) => b.score - a.score).map(h => h.e);
      if (fold(input.value).split(/[\s-]+/).filter(Boolean).join(' ') !== words.join(' ')) return;
      status.textContent = hits.length ? `${hits.length} result${hits.length === 1 ? '' : 's'}` : 'No results.';
      for (const entry of hits.slice(0, 30)) {
        const item = document.createElement('li');
        const link = document.createElement('a'); link.href = entry.url;
        const meta = document.createElement('span'); meta.className = 'search-result-meta';
        meta.textContent = [entry.type, entry.date].filter(Boolean).join(' · ');
        const title = document.createElement('strong'); highlight(title, entry.title, words);
        const text = document.createElement('span'); text.className = 'search-result-text'; highlight(text, snippet(entry, words), words);
        link.append(meta, title, text); item.append(link); list.append(item);
      }
    }).catch(() => { status.textContent = 'Search is unavailable right now.'; });
  };
  const open = () => { if (!dialog.open) { dialog.showModal(); load().catch(() => {}); } input.select(); render(); };
  toggle.addEventListener('click', open);
  dialog.querySelector('.search-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.querySelector('form').addEventListener('submit', event => { event.preventDefault(); const first = list.querySelector('a'); if (first) first.click(); });
  input.addEventListener('input', render);
  dialog.addEventListener('keydown', event => {
    if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
    const links = [...list.querySelectorAll('a')]; if (!links.length) return;
    event.preventDefault();
    const i = links.indexOf(document.activeElement);
    (event.key === 'ArrowDown' ? links[Math.min(i + 1, links.length - 1)] : i <= 0 ? input : links[i - 1]).focus();
  });
  document.addEventListener('keydown', event => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
    if ((event.key === '/' && !typing) || (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey))) { event.preventDefault(); open(); }
  });
})();

// Keep the giscus comment frame in the site's light/dark theme.
(() => {
  const box = document.querySelector('.giscus');
  if (!box) return;
  new MutationObserver(() => {
    const frame = document.querySelector('iframe.giscus-frame');
    const theme = document.documentElement.dataset.theme === 'dark' ? box.dataset.darkTheme : box.dataset.lightTheme;
    if (frame) frame.contentWindow.postMessage({ giscus: { setConfig: { theme } } }, 'https://giscus.app');
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
})();

// Archive calendar: show the hovered or focused day below the grid, and start scrolled to the latest weeks.
(() => {
  const grid = document.querySelector('.calendar-grid');
  const readout = document.querySelector('.calendar-readout');
  if (!grid || !readout) return;
  const initial = readout.textContent;
  const show = event => { const cell = event.target.closest('[data-tip]'); if (cell) readout.textContent = cell.dataset.tip; };
  grid.addEventListener('mouseover', show);
  grid.addEventListener('focusin', show);
  grid.addEventListener('mouseleave', () => { readout.textContent = initial; });
  const scroller = document.querySelector('.calendar-scroll');
  scroller.scrollLeft = scroller.scrollWidth;
})();
