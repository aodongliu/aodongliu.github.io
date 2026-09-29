# Adding and featuring content

Current rules, September 29, 2026. This is the shared handbook for Aodong and future agents.
Update it when behavior changes. The customized Matery theme is selected in `_config.yml`
for production. The isolated preview uses the same theme and content with local URLs and
`noindex`; building or editing does not itself deploy.

## Where to edit

| Task | File |
| --- | --- |
| Write/edit a post and its card | `source/_posts/<stable-slug>.md` |
| Work on an unpublished draft | `source/_drafts/<stable-slug>.md` |
| Add/edit a research paper | `source/_data/research.json` |
| Change homepage card counts or shared series cover | `source/_data/portfolio.yml` |
| Add ordinary article images | `source/images/<stable-slug>/` |
| Add original publication TOC images | `themes/matery/source/portfolio/papers/` |
| Update biography / downloadable CV | `source/about/index.md` / `source/files/aodongliu_cv.pdf` |
| Change page appearance | `themes/matery/layout/` and `themes/matery/source/css/` |

**Adding a post or paper requires no JavaScript changes.** `portfolio.js` creates routes
and passes metadata to templates. `lib/content-policy.cjs` implements reusable selection
rules. Neither should contain a list of post-specific titles, images or summaries.

## Add a post manually

Run commands from this repository's root:

```bash
npx --no-install hexo new draft strangerStats16_shortSlug
```

Edit the new Markdown file in `source/_drafts/`. The updated scaffold includes card fields.
For a Stranger Stats post, use front matter like this (example only):

```yaml
---
title: "Stranger Stats #16: The question this article answers"
date: 2026-09-28
categories:
  - Stranger Stats
tags: [nba, data, basketball]
comment: disqus
series_number: 16
summary: "One or two sentences explaining the question and why a reader might care."
cover: ""
cover_alt: ""
featured: false
featured_order: 100
---
```

The example is not a new factual claim or a publication. Replace it with your actual
title, date and article. Other kinds of writing can use another category and omit
`series_number` and `comment`. Any post with a `comment` field (the existing value
`disqus` is the long-standing convention) shows the site's comment thread once a provider
is configured; see "Comments" below. Leave the field off for posts without comments.

When ready to include it in the normal local preview:

```bash
npx --no-install hexo publish strangerStats16_shortSlug
node tools/check-content.cjs
node tools/preview.cjs build
node tools/check-preview.cjs
node tools/preview.cjs server
```

`hexo publish` promotes a draft into `_posts` **locally**. It does not deploy to the
internet, but it makes the post eligible for the next website deployment. Do not promote
unfinished content merely to feature it. Drafts are deliberately absent from the normal
preview; a separate draft-viewing mode has not been implemented yet.

If the preview is already running at http://127.0.0.1:4100/, do not start a second server.
It watches changes; refresh the browser after editing. Node module/selection-rule changes
may need a server restart. Ordinary post metadata changes do not.

## Post metadata and fallbacks

| Field | Meaning |
| --- | --- |
| `title` | Full article title. Required. |
| `date` | Actual publication date. Required for posts. Keep it stable after publication. |
| `categories` | Exact `Stranger Stats` membership adds the article to that collection. |
| `card_title` | Optional shorter headline for other categories. Stranger Stats always uses the exact Markdown `title`. |
| `summary` | Description metadata; can appear on other category cards. Stranger Stats cards never display summaries or subtitles. |
| `cover` | Optional local `/images/...` path or HTTPS image URL. Stranger Stats falls back to its existing series artwork; other posts show no image if absent. |
| `cover_alt` | Describe the meaningful image content. Required when specifying `cover`. |
| `series_number` | Positive integer for Stranger Stats; legacy titles containing `#N` still supply a fallback. |
| `featured` | Boolean `true` or `false`, never a quoted string. Defaults to false. |
| `featured_order` | Positive integer. Smaller numbers appear first among featured items. Defaults to 100. Ignored when not featured. |

Leave `cover` empty until you have the actual image. No fabricated placeholders. Keep
post covers in their original colors. **Stranger Stats covers are 13:7** (3.25 x 1.75, the
ACS TOC graphic shape the research cards also use); export them at 1950x1050 or larger at
the same ratio, keeping titles and faces clear of the outer 5%. Every card image frame is
13:7, so a matching cover fills it exactly and article cards stay uniform; a mismatched
cover shows a dark mat. `node tools/check-content.cjs` warns about mismatched covers.
Convert an existing cover by cropping background rows or columns only; if the key
content (faces, ball, stat text) spans the full height, regenerate it instead.
An explicit `cover` also appears at the top of the article. Publication TOCs use
contain sizing, preserving the entire scientific image without cropping or recoloring.

Legacy `sticky` and stock Matery `top`/carousel `cover: true` are **not** portfolio controls.
In this customized theme `cover` is an image path, not a boolean. Existing dated URLs
depend on filename and date: do not rename files or change dates to move an item higher.

## Highlight a post

Change only its front matter:

```yaml
featured: true
featured_order: 1
```

This does two things:

1. Makes a Stranger Stats post eligible for highlights beneath its homepage banner.
2. If it is a Stranger Stats post, moves it ahead of unfeatured entries on that collection page.

The Stranger Stats homepage section takes featured published Stranger Stats posts first,
ordered by ascending `featured_order`. Other categories stay in their own collections;
a feature flag alone does not place them under the Stranger Stats banner.
Ties use newest date first, then stable URL order. If there are fewer featured posts than
slots, remaining slots show recent unfeatured Stranger Stats posts. The default is three
slots, controlled by `homepage.post_limit` in `portfolio.yml`. Featuring more posts than
slots does not create more slots: the highest-priority ones appear. The remaining posts
are still available in their collections and archive. Selected cards show a Featured label.

Set `featured: false` to unfeature. Never change the article's publication date, body or
URL for this operation. Featuring does not promote a draft and does not deploy anything.
Archives and all-writing pages stay chronological.

## Add or feature a research paper

Add one object to the `papers` array in `source/_data/research.json`. Copy an existing
entry and replace every bibliographic field with verified details:

```json
{
  "id": "stable-paper-slug",
  "title": "Exact published title",
  "authors": "Full author list in publication order",
  "year": 2026,
  "venue": "Journal name",
  "citation": "Volume, pages or article number",
  "doi": "10.xxxx/actual-doi",
  "url": "https://doi.org/10.xxxx/actual-doi",
  "headline": "An accurate headline a nonexpert can understand",
  "summary": "Explain the problem and what this work contributes in plain language.",
  "overview": {
    "problem": "Why this matters, for someone with no chemistry background.",
    "approach": "What the method does, with one plain-language gloss per technical term.",
    "finding": "What the paper actually shows; only claims the abstract or paper supports."
  },
  "topic": "Scientific computing",
  "status": "Published",
  "featured": false,
  "featured_order": 100
}
```

That automatically creates the paper's detail page and collection card. The `headline` is
the card title everywhere: a short everyday-language sentence a non-scientist understands,
without jargon or acronyms ("Speeding up simulations of heavy metals with graphics cards").
The optional `overview` renders as three short panels on the paper page, between the
publication details and the abstract; keep each to two or three sentences. Keep the `id`
stable because it defines the URL. Keep the array in publication order, newest first;
the collection follows that order. Add `authorship_note` only when supported by the paper.
This collection currently contains published papers only; keep submitted/in-preparation
manuscripts separate until we design an explicit section for them.

To show a paper on the homepage, use `featured: true` and `featured_order` in that object.
`homepage.research_limit` sets the number of slots. Featured papers are ranked by order,
then year descending, then ID. If none are featured, the latest published papers fill
the section. If at least one is featured, only the featured selection appears (no filler).

When the real TOC is available, add:

```json
"image": "/portfolio/papers/stable-paper-slug.png",
"image_alt": "A useful description of this graphical abstract",
"image_source": "https://doi.org/10.xxxx/actual-doi",
"image_type": "Published graphical abstract"
```

Use the author's original TOC/graphical abstract or a verified source, preserve its
colors, and record provenance. A numbered figure is not a TOC and must not silently
replace one. The eight author-supplied originals are installed; their filename mapping
and checksums are in [research-image-sources.md](research-image-sources.md). Keep `image_type` and `image_source` as internal provenance metadata; never render
acquisition notes such as “author-supplied” as public captions. Paper images are clickable
links to the full-size original; do not show separate image-source or full-size caption
links. The publication already has a DOI link. No invented orbitals, charts, fake data,
grayscale redrawings or AI substitutes.

## Writing and visual style

- Balance academic and industry readers. Start with the question and significance;
  put technical detail after the accessible explanation.
- Be concrete about methods, findings, limitations and personal contributions. Do not
  infer contributions from author position or invent benchmarks, capabilities or results.
- Stranger Stats should sound conversational, curious and succinct. Posts #1–#7 are
  the voice reference. Bold key names and numbers. No em-dash punchlines or hype.
- Stranger Stats cards use the exact Markdown title with no summary/subheading. Other category card headlines can be shorter but must describe the same article.
  Write one or two original summary sentences, roughly 20–45 words. Do not paste abstracts.
- Use `##`/`###` headings for a readable article TOC. This navigation TOC is distinct
  from the graphical abstract/TOC image for a research paper.
- Keep visual styling in theme CSS and templates. Article Markdown is for prose,
  headings, media references and block tags; avoid new inline layouts/styles.
- Typography is Geist (text and headings) and Geist Mono (labels), self-hosted from
  `themes/matery/source/fonts/` under the SIL Open Font License (`Geist-OFL.txt`). Do not
  load fonts or CSS from third-party CDNs. Cards use soft rounded surfaces; one warm accent
  (`--accent`) marks links, the current page and focus. Stranger Stats cards show the series
  number in the label line ("No. 03 · Featured"), never on top of the cover art.
- Use warm ivory in light mode and warm charcoal with softer taupe cards in dark mode.
  Preserve original-color imagery. Future projects are not featured as working demos
  until an actual artifact exists.

## Stranger Stats source ownership

Analysis lives in the `strangerStats` workspace (`/Users/aodongliu/Personal/strangerStats`);
its `AGENTS.md` is the complete workflow for a new post, from data to screenshots. The
Markdown lives only here: agents write `source/_drafts/strangerStatsNN_slug.md` directly, so
there is no template or export to keep in sync, and website edits are never overwritten.

Data blocks live in `source/_html_blocks/pNN/` and are referenced with
`{% htmlblock pNN/descriptive_name %}`. Blocks for #1–#7 (and all new posts) are built from
the `ss-*` components in the analysis repo's `toolkit/ssblocks.py`: plain HTML with class
names, styled by the "Stranger Stats blocks" section of `themes/matery/source/css/article.css`,
so they follow the light/dark theme. Change the look there, never with inline styles. Drafts
#8–#15 still use older inline-styled blocks, shown inside a light `.legacy-html-block` panel
(`themes/matery/scripts/legacy-blocks.js` decides by the `ss-block` class); convert them to
components before publishing.

Preview drafts with `node tools/preview.cjs server --drafts` (http://127.0.0.1:4101; its own
cache, never written to disk), and screenshot any page with `node tools/screenshot.cjs`.

## Validation and handoff

```bash
node tools/check-content.cjs
node tools/preview.cjs build
node tools/check-preview.cjs
```

The metadata checker validates types and local cover paths. The generated-site checker
checks local links, anchors, publication pages, source-derived post counts, draft exclusion,
CV bytes and canonicals. Changing the number of papers or posts requires no test edits.
For ranking logic changes, also run `node --test tools/content-policy.test.cjs`.
Review the changed page in the browser, including a narrow layout when imagery changes.

Example instruction to another agent:

> Read AGENTS.md and docs/content-authoring.md. Add a draft about [topic], using the
> appropriate source workflow and original images. Set its card title and summary.
> Keep it unfeatured and do not deploy. Validate metadata and report changed files.

Or:

> Feature [existing post filename] with priority 1. Change only featured metadata,
> preserve its date and URL, and verify its homepage placement in the local preview.

Update this handbook and scaffolds whenever the rules change. Deployment is a separate
explicit action; neither a feature flag nor a request to write content authorizes it.

## Training, contact links, and current presentation rules

- Use simple section names: Research, Stranger Stats, Training, About, CV.
  Do not add promotional taglines, numbered section eyebrows, or decorative slogans.
- Research and Stranger Stats each use a full-width banner followed immediately by
  their own highlight cards. Do not add a separate Recent posts row or heading. The
  Research banner uses the North Cascades landscape configured under `research` in
  `portfolio.yml`. Future collection sections should follow this same grouping.
- Stranger Stats #1 uses the author-supplied image at `source/images/strangerStats01/cover.png`.
  To replace another cover, put the original in `source/images/<post-slug>/` and set `cover`
  and `cover_alt` in its front matter. Do not generate replacement article covers.
- A published post with `categories: [Training]` automatically appears at `/training/`,
  newest first. The existing weight-loss article is included. Future meet-preparation
  posts use the same category; drafts remain drafts until ready.
- Edit public contact/profile links in `source/_data/portfolio.yml` under `contact_links`.
  Instagram and WeChat were restored from the site's earlier Fluid-theme About page;
  email follows the supplied current CV. WeChat links to the existing QR image.
- `/cv/` is an HTML preview with an explicit PDF download. This avoids the in-app
  browser's blank PDF-viewer behavior. When replacing `source/files/aodongliu_cv.pdf`,
  regenerate `source/images/cv/page-*.png` using `pdftoppm -scale-to 1600 -png
  source/files/aodongliu_cv.pdf source/images/cv/page` and update the page count in
  `themes/matery/layout/cv.ejs` if it changes. The PDF remains the authoritative document.

## Unfinished posts

`strangerStats15_inchForInch.md` is explicitly unfinished and lives in `source/_drafts/`.
Do not publish or feature it without the author's instruction. Its analysis and HTML
blocks are retained. Build checks verify drafts are absent from all generated routes,
collections and the sitemap. Individual covers for published Stranger Stats #1–#7
are author-supplied; see `strangerstats-image-sources.md` for imported-file provenance.

Research cards show the original image, year/topic and title only. Keep full summaries
on the paper detail pages. Match homepage research and Stranger Stats image proportions
and card typography. Crop landscape banners with CSS; preserve full publication TOCs.

Research and Stranger Stats banner titles use the same sans-serif font and weight.
The North Cascades banner crop must keep both climbers visible on desktop and mobile. Keep only the
About link in the hero; the Research banner is the collection entry point.

Current homepage Stranger Stats pins are #1, #3, #7, in that order, selected by the
author. Keep their `featured` and `featured_order` values unless instructed otherwise.
Use the original `source/images/al_logo.png` for the brand and favicon. The light
palette uses warm ivory surfaces; dark mode uses warm charcoal with softer taupe cards.
The rejected cool grey-green/slate palette should not be restored. Do not use diagonal arrows anywhere in the website UI, including text links, navigation, banners and contact links.
Preserve original content colors and the white backing required by scientific TOCs.

## Phone preview on the same Wi-Fi

Build and validate first. Serve only `.preview/public`, not the repository root:

```bash
node tools/preview.cjs build
node tools/check-preview.cjs
ipconfig getifaddr en0
python3 -m http.server 4101 --bind <Wi-Fi-IP> --directory .preview/public
```

Open `http://<Wi-Fi-IP>:4101/` on a phone connected to the same network. Keep the Mac
awake and the server running. The IP can change; networks with client isolation may
block device-to-device access. This is a local preview, not public deployment. Rebuild
after edits to update the phone view. Drafts remain excluded from the generated site.


## Editing the layout consistently

Use `themes/matery/source/css/site.css` for shared colors, spacing and typography. Adjust
its existing light/dark color variables rather than appending competing palettes or
putting colors into Markdown. Keep the warm ivory default and warm charcoal/taupe dark
mode; do not restore the rejected cool green/slate scheme. Scientific images retain
white backing where needed for readability. Check text, borders, buttons, menus and
focus states in both modes after changing tokens.

The homepage is a compact introduction, then Research and Stranger Stats. Each collection
has one wide clickable image banner, with matching sans-serif titles, followed by its
own cards. Research cards show only image, year/topic and title; longer descriptions
belong on detail pages. Keep card proportions consistent across collections. Do not add
slogans, numbered labels, a Recent posts row, a redundant research hero button, circular
image arrow badges, or provenance captions. Keep the About hero link. The footer reads
`Hexo · Matery`. Preserve the author-approved introduction and original-color portrait.

For a future collection, add real content and a route first, then reuse the existing
banner/card pattern; do not create an empty showcase or imply unfinished projects work.
Navigation, page templates and shared partials live in `themes/matery/layout/`; ordinary
content edits belong in Markdown/YAML/JSON instead. Do not edit generated `public/` or
`.preview/public/` files: the next build replaces them.

To replace a post cover manually:

1. Save the original image under `source/images/<stable-slug>/` with a descriptive filename.
2. Set `cover: /images/<stable-slug>/<filename>` and accurate `cover_alt` in the post.
3. Keep the original colors and complete framing; change banner crops only in CSS.
4. Record source/provenance internally.
5. Build, validate, and inspect both its card and article on desktop/mobile.

To change the logo, replace `source/images/al_logo.png` deliberately and verify the
header/favicon in both modes. Edit profile links in `source/_data/portfolio.yml`, preserving
Email, LinkedIn, Google Scholar, GitHub, Instagram, WeChat and ORCID unless asked to remove
one. The Training category and navigation are permanent parts of the site.

## Production build, commit and deployment

The website checkout is self-contained: import reviewed CV/images/Markdown/HTML artifacts
from independently maintained source repositories, but never require another machine's
absolute paths at build time. On a second Mac, clone/pull this repository and run `npm ci`.
Do not synchronize `node_modules`, generated output, caches or `.deploy_git` between Macs.
Review imported output before committing; never import raw datasets or credentials.

Run from the repository root:

```bash
npm ci
npm run check:content
npm run preview:build
npm run check:preview
npm run preview
```

Stop the foreground preview with Ctrl-C when finished. Check desktop/mobile, both modes,
image framing, collection links, CV download and long article tables after layout changes.
The aliases run the same `tools/*.cjs` commands documented above.

For an explicitly authorized production release:

```bash
npm run clean
npm run build
npm run check:production
```

`check:production` runs `node tools/check-preview.cjs public --production`, checking the
production output rather than the noindex preview. Drafts, especially #15 Inch for inch,
must remain excluded. Run `node --test tools/content-policy.test.cjs` for changes to
selection logic. Review `git status` and the staged diff, select only intended source
changes, and write a concise commit message. Commit/push the source branch separately
from generated output. Never use a blanket add/reset to absorb or discard unrelated work.

When release checks pass and deployment is authorized:

```bash
npm run deploy
```

This validates and publishes the generated `public/` tree using `tools/publish.cjs`
and the destination in `_config.yml`; it does not build first or push the source branch.
The publisher requires a clean `.deploy_git`, fast-forwards it to the remote generated
branch, copies only built output, and pushes without force. If remote history diverges
or a concurrent update wins, it stops rather than overwriting that work. Verify the configured
repository/branch against GitHub Pages settings before changing them. Preserve generated
branch history, and never merge it into the source branch to resolve divergence. After
deploying, inspect the public homepage and changed routes; a successful push alone does
not prove GitHub Pages has finished publishing. Retain the prior source commit for
rollback: build and redeploy that reviewed version rather than force-resetting history.

A request to edit or feature content is not deployment authorization. This release was
explicitly requested by the author; future releases still need their own authorization.


## Independently maintained applications

Existing `source/impact-echo/` and `source/powerlifting-physics-lab/` directories contain
independently maintained static application exports. Preserve their `skip_render`
configuration and working direct app entry points. Do not hand-edit compiled bundles or
rewrite their asset paths as ordinary Hexo posts. Make application changes in the original
project, rebuild there, then import a reviewed complete export here with its provenance.
Check both entry pages and nested assets after any import. AlleyLoop and an unspecified
LLM project remain future ideas unless actual reviewed artifacts are provided.

The website source branch is `main`; generated GitHub Pages output uses `master`.
Pull/reconcile source changes before publishing from another Mac, retaining independently
maintained app exports. Do not confuse a source push with a generated-site deployment.

Keep independently deployed apps at their existing direct URLs. Do not add them to
public navigation or homepage sections until the author requests that promotion.
Before deploying from another checkout, fetch/merge the latest source and confirm
all existing static-app exports are retained. The generated branch is not an app source.

## Search appearance

Homepage search title uses `_config.yml` `title` and `subtitle`; description uses
`description`. Keep these accurate to the current role and published work. Google does
not use meta keywords for ranking. Page titles and descriptions can influence the search
result, but Google may select different text. Homepage WebSite structured data identifies
the site as Aodong Liu. The favicon link uses `/images/al_logo.png`; keep the legacy
`themes/matery/source/favicon.png` identical when replacing it. Keep the icon URL stable.
After an authorized deployment, use Search Console URL Inspection on the homepage and
Request indexing. Google recrawling and favicon updates may take days to weeks.

Homepage and series-page exception: Stranger Stats cards on the homepage and on `/strangerStats/` omit only the leading `Stranger Stats #N: ` prefix, since the series and number are already labeled. The rest of the Markdown title is unchanged. Tag, category and archive listings, search results and article titles retain the full title.

The theme supplements the standard sitemap with generated research routes. Keep all published paper pages in `sitemap.xml`; validators enforce this. Standalone app exports remain outside that discovery list.

Google Search Console ownership uses `google_site_verification` in `_config.yml`, rendered by `_partial/portfolio-head.ejs`. Preserve this field and tag through future theme changes and deployments; ownership verification depends on its continued presence.

## Tags, categories and archives

These pages follow the stock Matery demo (blinkfox.com) in the site's warm palette. To
keep the header short, only Archives is in the main navigation; Timeline / Tags /
Categories tabs at the top of each of these pages switch between them.

- `/tags/`: a card of every tag as a chip with its post count, then a tag cloud sized by
  post count. `/tags/<tag>/` repeats the chips with the current tag highlighted, then
  that tag's posts as cards.
- `/categories/`: category chips, then a posts-per-category bar chart. Matery draws a
  radar here, but a radar needs at least three categories to form a shape.
  `/categories/<name>/` works like a tag page.
- `/archives/`: a one-year post calendar (days with posts link to them), then a
  year/month timeline of posts with cover, date, category and tag chips.
- Each article shows its category and tag chips under the date.

Chip tints come from a stable hash of the name (`taxonomy_tint` in `portfolio.js`), so a
tag keeps its color everywhere. Categories are broad collections (`Stranger Stats`,
`Training`); tags are narrower topics. Add player or team tags only when the article
actually covers them, and reuse existing spellings (the Tags page shows them all).
Everything is generated from front matter; no template edits are needed for new tags.

## Search

The magnifier button in the header opens a search dialog (also `/` or Ctrl/Cmd+K).
It lazily loads the generated `/search.json`, which contains every published post
(title, category, tags, summary, body text) and every paper in `research.json`; drafts
are excluded. Results match every typed word, rank title matches first and show a
highlighted snippet. New posts and papers are indexed automatically on the next build.
Descriptive titles, summaries and tags make the best search terms.

## Comments

Comments render on posts with a `comment` field when `comments` in `_config.yml` is fully
configured. Until then no comment section appears. Two providers are supported:

- `giscus` (active): comments are stored as GitHub Discussions in this repository, in
  the `Announcements` category (only the owner and giscus can open threads; anyone signed
  in to GitHub can reply). Free, ad-free, no tracking; moderate or delete comments in the
  repository's Discussions tab. The giscus GitHub app is installed on this repository
  only. If the category changes, get new IDs from
  `https://giscus.app/api/discussions/categories?repo=aodongliu/aodongliu.github.io`.
- `disqus`: set `provider: disqus` and `disqus.shortname` to a forum you own at
  disqus.com. Guests can comment, but the free plan shows ads and tracks readers.

Threads map to the post's URL path, so keep dated URLs stable. The site never had its
own Disqus forum: the `fluid` shortname in the retired Fluid-theme config belongs to an
unrelated site and must not be reused. A local preview may not load the external comment script.
