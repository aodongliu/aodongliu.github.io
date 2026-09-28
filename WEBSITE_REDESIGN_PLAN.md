# Historical website redesign proposal

**Historical planning record, September 28, 2026. Not current instructions.** The author
subsequently selected a customized Matery design, supplied all publication and published
Stranger Stats covers, and approved the warm, compact layout. Several initial proposals
below were rejected, including dark-first styling, technical labels and substitute paper
illustrations. Do not implement those proposals or use this document as a status report.

Follow [docs/content-authoring.md](docs/content-authoring.md) for the current design,
manual editing, source ownership, draft policy and release procedure. Production is now
configured for Matery; actual deployment status must be verified separately. Existing
`impact-echo` and `powerlifting-physics-lab` app exports are retained at their direct URLs without adding them to public navigation. Their existence supersedes the earlier future-only project assumptions below.

The text below is preserved only to explain the original planning context.

## Objective and positioning

Build a portfolio with a blog: visitors should quickly understand Aodong's research, computational skills, and independently built projects. Keep theoretical chemistry as the foundation while making its transferable methods visible through concrete work. The user confirmed a balanced academic and industry audience.

Provisional homepage copy: **Aodong Liu / Scientific computing, data, and interactive software.** Supporting copy should connect quantum dynamics research to numerical algorithms, software implementation, and data analysis. Confirm current affiliation and career stage before publication. Do not claim LLM expertise, performance improvements, or project maturity without evidence.

## Current findings

- Hexo 7 with Fluid is active. The homepage uses a full-height image banner and a chronological feed; research, publications, games, and LLM projects have no dedicated source pages yet.
- Fluid already supports post cover images, dark mode, and a TOC. The requested presentation does not require migration, although Matery's image grid is a reasonable candidate.
- Local content includes 10 posts, 7 drafts, and 152 HTML blocks at audit time. Existing staged, unstaged, and untracked changes must be preserved, including draft moves and generated blocks.
- Source is on `main`; local remote-tracking metadata points to generated output on `master`. The local `master` has diverged. There is no deployment Actions workflow, and the manual deploy configuration does not explicitly name a branch. Verify actual GitHub Pages settings before changing deployment.
- The StrangerStats workspace is not currently a Git repository. Its manifest assembler is a useful starting point, but export ownership and draft handling need correction before automation.
- The current p15 website article and exporter manifest have drifted. Reconcile them explicitly; do not force-export over website edits.
- Custom content relies on Fluid CSS variables and icons; some HTML blocks hardcode light backgrounds. A new theme alone will not restyle them safely.
- The Fluid configuration injects a homepage canonical link globally. Replace this with one correct canonical per page during implementation.

## Design direction

Use charcoal `#151719`, graphite panels `#222528`, milk white `#F3F1EB`, muted text `#B6B9BB`, and restrained borders `#41464A` as starting tokens. Test final contrast rather than assuming these cover every state. Provide a light reading option.

Use generous spacing, clear typography, small technical labels, a consistent image ratio, and subtle motion. Avoid a full-screen scenic hero, rotating banners, decorative counters, autoplay, and skill-percentage charts. Color can remain in scientific figures and data visualizations when it communicates information. Do not apply blanket grayscale to charts.

Cover images should come from the work: a scientific figure, a Stranger Stats chart, a game screenshot, or an LLM interface. Each card should communicate a question, contribution, and route to evidence. Cover thumbnails and article TOCs are separate features; support both.

Launch navigation: **Research / Stranger Stats / About**, with a prominent **CV** link. Add **Projects** when there is a substantive project write-up or working prototype to visit. Keep additional personal writing accessible through Writing or the archive. Do not make launch depend on finishing planned applications.

Homepage order:

1. Compact introduction and links to selected work, CV, and contact.
2. Two or three selected research stories with visual covers and links to the full collection of eight papers.
3. Stranger Stats as a featured data-analysis project, plus two or three selected articles with distinct covers.
4. Optional compact work-in-progress note when useful material exists; unfinished projects are not equal-weight featured work.
5. Brief personal introduction and contact links.

Research pages should serve two audiences: a plain-language problem/contribution/result first, followed by methods, figures, publication details, and technical links. Project case studies should identify the problem, personal contribution, implementation, evidence, limitations, and demo/source links. LLM examples should include evaluation and failure cases where available; games should be playable with minimal friction.

## Confirmed content and future projects

The user reports eight research papers. Research is the first new section to build; Stranger Stats is the existing public content section at `/strangerStats/`. Publication titles, details and personal contributions still need source verification.

Each paper should have a consistent visual cover (interpreting "profile photo" as a representative paper image), a plain-language headline and short explanation, the exact citation/year, and a paper link. Use an existing figure or an accurate simplified diagram. A detail page can explain the question, why it matters, the user's contribution, and findings before the technical abstract/methods. Show a complete list of all eight papers, while featuring only two or three on the homepage. Distinguish personal contributions from coauthor contributions and use performance numbers only when supported. Put Aodong's portrait in the introduction/About area rather than repeating it on every paper card.

| Project | User-reported status | Future presentation |
| --- | --- | --- |
| Stranger Stats | Existing section | Data questions, reproducible analysis, visual explanations, selected articles |
| AlleyLoop | Not ready | Find the shortest chain connecting two NBA players through common teammates; explain graph modeling and pathfinding once implemented. Other sports and movies are future extensions, not current capabilities. |
| Powerlifting Lab | Not ready | Explore squat, bench press and deadlift force analysis with a skeleton model. Later explain model assumptions, inputs and validation; describe it as a modeling tool, not a validated coaching or injury-prediction system. |
| LLM project | Not ready; scope unspecified | Reserve architecture for a future case study; do not invent a project name, use case, results or demo. |

These projects form a coherent future portfolio around computational modeling, data and interactive software. Keep them in the internal roadmap initially. Promote each to the public Projects section when it has a meaningful artifact, with explicit status and only working links. A clearly labeled prototype may be showcased before it is fully complete.

## Theme decision

Prototype Matery first because its card grid matches the user's preference. Use a pinned upstream revision, disable optional decoration/integrations, and keep a small documented customization layer. Where template changes are necessary, track them explicitly rather than modifying installed dependencies invisibly.

Compare a homepage and one demanding Stranger Stats article against a restyled Fluid version using identical content. Select based on readability, card layout, mobile rendering, table/code/math compatibility, accessibility, load cost, and the amount of theme code that must be maintained. NexT is a secondary candidate if a quieter, writing-focused design becomes the priority; do not run an open-ended theme search.

Switching the basic theme is small work; polished layout customization and content compatibility are moderate work. Confirm effort after the prototype. Preserve existing dated article URLs and `/files/aodongliu_cv.pdf`; if routes change, provide redirects.

## Repository and publishing contract

| Repository | Canonical ownership | Website receives |
| --- | --- | --- |
| Website | Navigation, design, portfolio copy, publication metadata, imported release artifacts | Reviewed pages and assets |
| CV source | Editable CV source and build instructions | PDF at the stable existing URL |
| StrangerStats | Analysis, editorial source, manifest, renderers, data provenance | Markdown, HTML blocks, chart assets |
| Each game or LLM project | Application code, tests, dependencies, deployment | Project metadata plus a pinned static build or demo link |

Keep these independent. The website should build from its own checkout without depending on another Mac's folder paths or rerunning expensive research analyses. Commit modest publication artifacts, including the CV PDF, in the website repository. Keep raw datasets, credentials, environments, caches, and large build products out; record dataset sources, versions, and checksums as appropriate.

An export manifest should record project ID, source repository and commit, explicit publication state, destination files, build command, export time, and checksums. An importer should be idempotent, show a dry-run diff, touch only owned files, detect hand-edited output, and stop on conflicts. Draft export must remain a draft. Draft validation also needs to prevent associated private assets from leaking through copied public files.

For Stranger Stats, move canonical editorial ownership to the analysis repository after reconciling existing edits. Once adopted, correct the source and re-export instead of editing generated website copies. An explicit promotion step should move reviewed content into published posts. Avoid two-way sync and avoid overwriting drafts via legacy assemblers.

Across Macs: clone the same source repositories, pull before work, commit and push source plus deliberate exports, and pull on the other Mac. Pin dependency/runtime versions and document setup. Do not sync `node_modules`, `public`, or `.deploy_git` between machines. Start with a manual reviewable export command; add cross-repository automation only once the contract works.

Prefer one GitHub Actions build/deployment from reviewed website source after validating current hosting configuration. Keep generated output out of the source branch; use a deployment artifact. Preserve the existing deployment history for rollback. Do not merge generated `master` content into source to resolve divergence blindly.

Static games can use project Pages sites or imported builds with verified asset base paths. LLM demos that require server-side secrets or inference need a separate backend; the portfolio provides the explanation and entry point. A recorded demonstration is acceptable when a live service is unavailable, clearly labeled.

## Sequenced work and delegation

The lead owns design direction, prioritization, integration, factual review, and final acceptance. Delegate bounded tasks with clear file ownership and independent checks; routine inventories and link checks can use lighter workers, while theme integration and publishing contracts merit stronger reasoning. Do not assign concurrent edits to shared configuration.

| Phase | Worker scope | Reviewable deliverable | Completion check |
| --- | --- | --- | --- |
| 0. Preserve and inventory | Repository/workflow audit | Content inventory, current URL map, source ownership and deployment map | Existing edits accounted for; drafts and source/output branches understood |
| 1. Position and design | Lead with content/design reviewer | Homepage copy, navigation, representative content, desktop/mobile layout | Research and projects discoverable immediately; factual claims supported |
| 2. Theme prototype | Theme worker; independent compatibility reviewer | Local Matery prototype plus compact Fluid comparison | One representative post renders tables, math, code, TOC, covers and CV correctly |
| 3. Content and export contract | Publishing worker separate from theme files | Draft-safe export/import, provenance manifest, setup guide | Repeat import is unchanged; conflicts stop; fresh website checkout builds alone |
| 4. Portfolio implementation | Content worker with confirmed project sources | Homepage, research, project pages, Stranger Stats index | Real evidence and demos; no placeholder claims; consistent visual assets |
| 5. Integration and release | Independent QA, then lead review | Responsive preview, link report, deployment and rollback procedure | Existing URLs/CV work; drafts absent; correct canonicals; keyboard and mobile checks pass |

Phase 0 audits began during this planning pass. No build, migration, commit, push, or deployment was run. The next implementation milestone should be a local homepage and representative article prototype, before a site-wide switch.

## Validation targets

- Production build excludes drafts and draft content from search/index data and public assets.
- All custom HTML blocks exist; missing blocks should become actionable build failures rather than invisible omissions.
- Existing article URLs and CV download remain reachable.
- Test narrow mobile, tablet, and desktop layouts; wide tables scroll without breaking the page.
- Verify math, code highlighting, anchor links, TOC, keyboard focus, image alt text, color contrast, and reduced-motion behavior.
- Check each page's title, description, canonical and social preview; optimize images and remove unused third-party features.
- Check demo base paths and error states; ensure no API secrets enter static assets.
- Build from a clean checkout using documented dependencies before release; retain a known-good rollback reference.

## Inputs to confirm

- Titles/DOIs or a publication list for the eight papers, representative figures, and accurate personal contributions.
- Repositories and useful artifacts for AlleyLoop and Powerlifting Lab when available; LLM project scope when chosen.
- CV source location and current update date.
- Whether the MacBook is a local development copy or also a separate public host.

## Reference material

- Matery features and installation: https://github.com/blinkfox/hexo-theme-matery
- Matery demo: https://blinkfox.com/ (web text accessible; browser visual inspection failed DNS in this session)
- Fluid upstream: https://github.com/fluid-dev/hexo-theme-fluid
- NexT upstream: https://github.com/next-theme/hexo-theme-next
- GitHub Pages static hosting: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages

These are proposed decisions to refine through prototypes, not a claim that the theme migration has already been tested.
