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
- For new Stranger Stats analysis, follow the analysis repository's AGENTS.md and
  creation skill. Check its canonical article template before editing generated output;
  never run a force export over website changes. See the authoring guide's current caveat.
- Update the authoring guide, scaffolds and relevant validation in the same change
  whenever a content field or publishing rule changes. Do not leave conflicting instructions.
- Delegate bounded implementation/review tasks when useful in this user-authorized
  collaboration; keep file ownership separate and integrate/review changes before delivery.

- Use direct section names and compact layouts. No promotional taglines or decorative
  section labels. Preserve Training navigation and public contact links. See the handbook.

- Homepage Stranger Stats pins are #1, #3, #7, in that order. #15 Inch for inch is an
  unfinished draft; keep it excluded from generated routes, collections and indexes.
- Research and Stranger Stats use matching wide banners and compact cards. Keep both
  climbers in the North Cascades crop. No Recent posts row, circular image arrows,
  research-card descriptions, redundant Research hero button or public provenance notes.
  Paper images themselves open full-size; do not add source/full-size caption links.
- Preserve the original logo/favicon, color portrait, 2020–2026 PhD dates, all contact
  links and the CV preview/download. Footer: `Hexo · Matery`.

- Stranger Stats cards use the exact Markdown `title`, with no summary/subheading. Remove all diagonal arrows from website UI, including navigation, banners and contact links.

Homepage and series-page exception: Stranger Stats cards on the homepage and on `/strangerStats/` omit only the leading `Stranger Stats #N: ` prefix, since the series and number are already labeled. The rest of the Markdown title is unchanged. Tag, category and archive listings, search results and article titles retain the full title.
