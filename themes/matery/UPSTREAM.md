# Customized Matery portfolio

Based on blinkfox/hexo-theme-matery, pinned master commit
`238f457ada1caafc07d1a7e48fef8eb1e03c1134`.
Source: https://github.com/blinkfox/hexo-theme-matery
Upstream Apache-2.0 license is preserved in LICENSE.

This is a substantial local customization, not a stock Matery configuration.
The portfolio shell, research layouts, content cards, article presentation and
CSS replace the colorful default presentation. Optional upstream integrations
are not used. In September 2026 every unused upstream file (stock layouts, partials,
widgets, libs, medias, languages, theme _config.yml, READMEs, CHANGELOG) was deleted;
compare against the pinned commit above if an upstream file is ever needed again.
Everything in this directory is now live code or assets.

Added/changed custom files: layout/layout.ejs, layout/index.ejs,
layout/portfolio.ejs, layout/research.ejs, layout/paper.ejs,
layout/_partial/portfolio-*.ejs, layout/_partial/stats-card.ejs,
layout/_partial/research-card.ejs, layout/_partial/{taxonomy-chips,post-chips,archive-tabs,comments}.ejs,
page/post/archive/taxonomy/about/404 layouts,
source/css/site.css, source/css/article.css, source/fonts/* (Geist, OFL), source/js/site.js,
source/portfolio/*, scripts/portfolio.js,
scripts/legacy-blocks.js. Review these against this pinned upstream before upgrades.

Content authoring and featured selection are documented in `docs/content-authoring.md`
at the website root. Post-specific copy is front matter, not a theme lookup table.
Shared selection logic lives in `lib/content-policy.cjs` at the website root.

For current design and operation rules, use [the authoring handbook](../../docs/content-authoring.md).
Upstream README files describe stock Matery, not this customized site.
