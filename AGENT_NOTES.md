# Agent Notes

Notes for anyone (human or agent) writing content on this site.

For current website metadata, images, highlighting and preview commands, read
[the content authoring guide](docs/content-authoring.md). The statistical rules below
supplement that guide. Do not add per-post content to theme JavaScript.

## Writing style

- **No em-dash ("—") punchlines.** Avoid "X — more than Y" reveal constructions in
  body text, e.g. do NOT write:

  `57 fantasy points on defense alone — more than his 38 points`

  Write it plainly instead:

  `57 fantasy points on defense alone, more than his 38 points`

- Keep the tone easy, conversational, and succinct. Bold the key numbers and names.
  Posts #1–#7 are the reference for voice.

## Stranger Stats workflow

The full workflow for a new post is the analysis repo's `AGENTS.md`
(`/Users/aodongliu/Personal/strangerStats`). In short: analysis there, blocks built with its
`toolkit/ssblocks.py` into `source/_html_blocks/pNN/`, the post written as a draft in
`source/_drafts/`, checked with `toolkit/check_post.py`, the drafts preview and
`tools/screenshot.cjs`. Aodong publishes; agents never do.

## Fantasy-points scoring (for posts that rank fantasy games)

- **Local dataset** (not StatMuse): load it with `toolkit/data.py` in the analysis repo
  (`connect()` builds a cached SQLite of the newest snapshot in `data/`).
- **FanDuel** = PTS + 1.2·REB + 1.5·AST + 3·STL + 3·BLK − TOV.
- **DraftKings** = PTS + 0.5·3PM + 1.25·REB + 1.5·AST + 2·STL + 2·BLK − 0.5·TOV
  + 1.5·(double-double) + 3·(triple-double), where DD = 2+ of {PTS,REB,AST,STL,BLK} ≥ 10
  and TD = 3+ of them ≥ 10. **The DD and TD bonuses stack.**
- **Era cutoff:** filter `gameDate >= '1977-10-01'` (steals/blocks tracked since 1973-74,
  turnovers since 1977-78). The dataset stores pre-tracking values as `0` rather than null,
  so you must use a date filter or Wilt's 1960s games will dominate.
- StatMuse is for **cross-checking only**; compute the ranking from the local dataset.


## Website handoff

The [authoring handbook](docs/content-authoring.md) is the single current reference for
manual editing, cover replacement, highlighting, CV updates, colors, previews and release
commands. Follow it rather than the historical redesign proposal or upstream Matery docs.
Keep website card metadata in front matter; the Markdown lives only in this repo.

Preserve the author's #1/#3/#7 homepage pins. #15 Inch for inch remains an unpublished
draft. Use original supplied cover images, not generated replacements. Keep internal
provenance and acquisition notes out of public captions. The theme uses compact banner
sections, warm ivory light mode and warm charcoal/taupe dark mode, with no decorative
slogans or circular arrow badges. Validate metadata, generated links and draft exclusion
before handing work off; publishing requires explicit authorization.

- Stranger Stats cards use the exact Markdown `title`, with no summary/subheading. Remove all diagonal arrows from website UI, including navigation, banners and contact links.

Homepage exception: Stranger Stats cards omit only the leading `Stranger Stats #N: ` prefix, since the series and number are already labeled. The rest of the Markdown title is unchanged; collection and article titles retain the full title.
