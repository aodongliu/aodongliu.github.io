# Website working rules

Before editing content or presentation, read [docs/content-authoring.md](docs/content-authoring.md).
It is the living source of truth for authoring, metadata, highlighting, images and previewing.
Read [AGENT_NOTES.md](AGENT_NOTES.md) for Stranger Stats analysis and voice details.

- Inspect Git status and preserve unrelated staged, unstaged and untracked work.
- Routine post changes belong in Markdown front matter, not JavaScript lookup tables.
  Publication entries belong in `source/_data/research.json`; homepage limits and
  series defaults belong in `source/_data/portfolio.yml`.
- Use `featured: true` and `featured_order` for curation. This never means publish,
  deploy, change the date, or change the URL. Do not choose featured posts unless
  requested; preserve existing selections.
- Use original author-supplied TOC/graphical abstracts or verified publication imagery
  with provenance. Preserve colors. Never generate or invent substitute paper images.
  All eight author-supplied TOCs are installed; see docs/research-image-sources.md.
- Keep warm ivory light mode and warm charcoal/taupe dark mode with original-color
  imagery. Do not restore rejected cold green/slate palettes or monochrome illustrations.
- Preview using `node tools/preview.cjs server`, build with `node tools/preview.cjs build`,
  and validate with `node tools/check-content.cjs` and `node tools/check-preview.cjs`.
  For selection-logic changes also run `node --test tools/content-policy.test.cjs`.
- `_config.yml` selects the customized Matery theme for production. Preview output stays
  isolated under `.preview/`. Production: `npm run clean`, `npm run build`, then
  `npm run check:production`. Do not deploy, commit or push unless requested; the author
  authorized this release, not automatic future releases. Verify public output after deploy.
- New Stranger Stats posts come from the analysis repo (`/Users/aodongliu/Personal/strangerStats`,
  follow its AGENTS.md). Posts are drafts in `source/_drafts/`; blocks are built with its
  `toolkit/ssblocks.py` and styled only by the `ss-*` rules in `article.css`.
- Check pages visually: `node tools/screenshot.cjs <post-slug | /path/>` (desktop light and phone
  dark tiles). Drafts: `node tools/preview.cjs server --drafts` (port 4101).
- Update the authoring guide, scaffolds and relevant validation in the same change
  whenever a content field or publishing rule changes. Do not leave conflicting instructions.
- Delegate bounded implementation/review tasks when useful in this user-authorized
  collaboration; keep file ownership separate and integrate/review changes before delivery.

- Use direct section names and compact layouts. No promotional taglines or decorative
  section labels. Preserve public contact links. Training is hidden from the nav until
  Aodong says the page is ready; the page itself stays. See the handbook.

- The homepage focuses on Research (banner + cards). Stranger Stats, AlleyLoop and future apps
  appear only as compact "Side projects" banners (`projects` in `portfolio.yml`), no cards.
  Stranger Stats featured posts (#1, #3, #7) are the series page's Pinned panel; the newest
  post gets a "New!" sticker automatically. #15 Inch for inch is an
  unfinished draft; keep it excluded from generated routes, collections and indexes.
- Research uses a wide banner and compact cards; the Stranger Stats series page keeps its
  cards. Keep both climbers in the North Cascades crop. No Recent posts row, circular image arrows,
  research-card descriptions, redundant Research hero button or public provenance notes.
  Paper images themselves open full-size; do not add source/full-size caption links.
- Preserve the original logo/favicon, color portrait, 2020–2026 PhD dates, all contact
  links and the CV preview/download. Footer: `Hexo · Matery`.

- Stranger Stats covers are 13:7 (e.g. 1950x1050), the same frame as research cards.
- Stranger Stats cards use the exact Markdown `title`, with no summary/subheading. Remove all diagonal arrows from website UI, including navigation, banners and contact links.

Series-page exception: Stranger Stats cards on `/strangerStats/` omit only the leading `Stranger Stats #N: ` prefix, since the series and number are already labeled. The rest of the Markdown title is unchanged. Tag, category and archive listings, search results and article titles retain the full title.
