# Preview and release reference

The customized Matery theme is configured for production in `_config.yml`. The isolated
preview uses `_config.preview.yml` for local URLs and `noindex`, with output/cache in
ignored `.preview/`. A production configuration change is not proof of a completed deploy.

For all authoring and visual rules, follow [content-authoring.md](content-authoring.md).
This file is a short command reference, not a competing design specification.

```bash
npm run check:content
npm run preview:build
npm run check:preview
npm run preview
```

The preview is at http://127.0.0.1:4100/. Do not start a second server if one already
owns that port. Refresh after edits; restart after Node helper changes. For a phone,
serve `.preview/public` over the Mac's Wi-Fi address as described in the handbook.

For an authorized production release, run `npm run clean`, `npm run build`, and
`npm run check:production` before `npm run deploy`. Source lives on `main`; generated
GitHub Pages output is deployed to `master`. Push source separately. Inspect the public
site after deployment; do not infer publication from a local preview or successful build.

## What to verify

- Warm ivory default and warm charcoal/taupe dark mode; original-color logo and portrait.
- Matching Research/Stranger Stats banner titles; both climbers visible in the landscape.
- Compact cards, original full TOCs, no circular arrows, captions or decorative slogans.
- Stranger Stats #1/#3/#7 highlighted in order; unfinished #15 excluded.
- Research, Stranger Stats, Training, About, CV and restored contact links work.
- Paper images open full-size, DOI links reach publications, PDF download works.
- Independently maintained app exports retain working entry points and asset paths.
- Mobile menus, keyboard focus, theme controls, image framing and wide article tables.

The checkers derive counts from source and check local links/anchors, canonical URLs,
preview noindex or production indexing, HTML blocks, draft exclusion and CV bytes. Do not
hardcode today's content counts into tests. For selection-policy changes, also run
`node --test tools/content-policy.test.cjs`. Math rendering still requires visual checking
when an article first introduces a new equation; link validation cannot establish it.
